#!/usr/bin/env python3
"""Probe Data360 metadata for the 20 candidate indicators."""
import json
import urllib.request

INDICATORS = [
    "WB_WDI_NY_GDP_PCAP_CD",
    "WB_WDI_NY_GDP_MKTP_KD_ZG",
    "WB_WDI_FP_CPI_TOTL_ZG",
    "WB_WDI_GC_DOD_TOTL_GD_ZS",
    "WB_WDI_BX_KLT_DINV_WD_GD_ZS",
    "WB_WDI_BN_CAB_XOKA_GD_ZS",
    "WB_WDI_SI_POV_GINI",
    "WB_WDI_SI_POV_DDAY",
    "WB_WDI_SI_POV_LMIC",
    "IPC_IPC_PHASE",
    "WB_WDI_SE_PRM_ENRR",
    "WB_WDI_SE_SEC_ENRR",
    "WB_WDI_SE_XPD_TOTL_GD_ZS",
    "WB_WDI_SH_STA_MMRT",
    "WB_WDI_SH_DYN_MORT",
    "WB_WDI_SH_XPD_CHEX_GD_ZS",
    "WB_WDI_SL_TLF_CACT_FE_ZS",
    "WB_WDI_SL_UEM_TOTL_ZS",
    "WB_WDI_GE_EST",
    "WB_WDI_CC_EST",
]

LAC = {"GTM", "HND", "ARG", "ECU", "MEX"}


def probe(idno: str) -> dict:
    body = json.dumps({"query": f"&$filter=series_description/idno eq '{idno}'"}).encode()
    req = urllib.request.Request(
        "https://data360api.worldbank.org/data360/metadata",
        data=body,
        headers={
            "Content-Type": "application/json",
            "User-Agent": "abrimos-data360-monitor/0.1 (https://github.com/Abrimos-info/abrimos-data360-monitor)",
            "Accept": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            d = json.loads(resp.read())
    except Exception as e:
        return {"idno": idno, "exists": False, "error": str(e)}

    if d.get("@odata.count", 0) == 0:
        return {"idno": idno, "exists": False}

    sd = d["value"][0].get("series_description", {})
    tp = (sd.get("time_periods") or [{}])[0]
    licenses = sd.get("license") or []
    countries = sd.get("ref_country") or []
    country_codes = {c.get("code") for c in countries}
    lac_coverage = sorted(country_codes & LAC)

    return {
        "idno": idno,
        "exists": True,
        "database_id": sd.get("database_id"),
        "periodicity": sd.get("periodicity"),
        "time_start": tp.get("start"),
        "time_end": tp.get("end"),
        "date_last_update": sd.get("date_last_update"),
        "n_countries": len(countries),
        "lac_coverage": ",".join(lac_coverage) if lac_coverage else "-",
        "license": (licenses[0].get("name") if licenses else "-"),
    }


def main():
    rows = [probe(i) for i in INDICATORS]
    header = ["IDNO", "DB", "PERIODICITY", "RANGE", "LAST_UPD", "N_C", "LAC", "LICENSE"]
    print(
        "{:<32} {:<8} {:<11} {:<14} {:<10} {:>4} {:<22} {}".format(*header)
    )
    print("-" * 130)
    for r in rows:
        if not r["exists"]:
            print(f"{r['idno']:<32} {'MISSING':<8}")
            continue
        rng = f"{r['time_start']} - {r['time_end']}" if r["time_start"] else "-"
        print(
            "{:<32} {:<8} {:<11} {:<14} {:<10} {:>4} {:<22} {}".format(
                r["idno"],
                r["database_id"] or "-",
                r["periodicity"] or "-",
                rng,
                str(r["date_last_update"] or "null"),
                r["n_countries"],
                r["lac_coverage"],
                r["license"],
            )
        )


if __name__ == "__main__":
    main()
