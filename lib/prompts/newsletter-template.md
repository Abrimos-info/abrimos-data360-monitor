
# Newsletter diario LAC — shape JSON de salida

## Shape completo

```json
{
  "edition": {
    "scope": "LAC | ISO-3",
    "label": "LAC | nombre del país",
    "date_iso": "YYYY-MM-DD",
    "country_iso": null,
    "is_dry_day": false
  },
  "subject": {
    "es": "Asunto en español (≤ 70 chars target, 60-75 tolerado, no empieza con cifra)",
    "en": "Subject in English (same target)"
  },
  "preheader": {
    "es": "Pre-encabezado en español (≤ 110 chars, complementa subject sin repetirlo)",
    "en": "Pre-header in English (≤ 110 chars)"
  },
  "greeting": {
    "es": "Una frase. Fecha + N indicadores se movieron en LAC/[país] el día de ayer.",
    "en": "One sentence. Date + N indicators shifted in LAC/[country] yesterday."
  },
  "hero": {
    "noticia_id": "NXXXXX",
    "country_iso": "ISO-3",
    "dataset_id": "ID_DATASET",
    "title": {
      "es": "Título literal heredado de noticia.title.es",
      "en": "Title literal heredado de noticia.title.en"
    },
    "lede_absorbed": {
      "es": "Primer párrafo escrito por el editor (60-90 palabras). Tres frases: encuadre del día + cifra con {{claim:CLAIM_ID|valor}} + hito o comparación. Enlace markdown al dataset Data360.",
      "en": "First paragraph adapted to EN (same word count target)."
    },
    "story_excerpt": {
      "es": "Segundo párrafo heredado/adaptado de noticia.story.es (60-90 palabras). Sin cifras nuevas, sin interpretación nueva.",
      "en": "Second paragraph adapted to EN."
    },
    "cta_link": "/?noticia=NXXXXX",
    "claim_tokens": ["CLAIM_ID_1", "CLAIM_ID_2"],
    "verification_trace_ok": true
  },
  "featured": [
    {
      "noticia_id": "NXXXXX",
      "country_iso": "ISO-3",
      "flag_emoji": "🇲🇽",
      "title": {
        "es": "Título corto heredado (≤ 120 chars)",
        "en": "Short title (EN, ≤ 120 chars)"
      },
      "one_liner": {
        "es": "Una frase factual con cifra + {{claim:CLAIM_ID|valor}} + enlace markdown al dataset si aplica. 25-50 palabras.",
        "en": "One factual sentence in EN, same target."
      },
      "cta_link": "/?noticia=NXXXXX",
      "claim_tokens": ["CLAIM_ID_1"],
      "verification_trace_ok": true
    }
  ],
  "orphan": {
    "noticia_id": "NXXXXX",
    "country_iso": "ISO-3",
    "badge": {
      "es": "Indicador huérfano",
      "en": "Underreported indicator"
    },
    "blurb": {
      "es": "Datos que se actualizaron y casi nadie cubrió.",
      "en": "Data that updated and almost no one covered."
    },
    "title": {
      "es": "Título literal heredado",
      "en": "Title literal heredado"
    },
    "lede_absorbed": {
      "es": "Primer párrafo (60-90 palabras). Arranca directo, sin encuadre del día. País + verbo + hecho + cifra + {{claim:CLAIM_ID|valor}} + enlace dataset.",
      "en": "First paragraph in EN."
    },
    "story_excerpt": {
      "es": "Segundo párrafo heredado/adaptado (60-90 palabras). Trayectoria + LAC + global.",
      "en": "Second paragraph in EN."
    },
    "coverage_note": {
      "es": "Frase final con gdelt_mentions_7d. Ver newsletter-task §Bloque 6 para las tres variantes (0, 1, ≥2 menciones).",
      "en": "Final sentence with gdelt_mentions_7d in EN."
    },
    "cta_link": "/?noticia=NXXXXX",
    "claim_tokens": ["CLAIM_ID_1"],
    "gdelt_mentions_7d": 1,
    "verification_trace_ok": true
  },
  "close": {
    "type": "default | thematic",
    "es": "Cierre según lógica dual. Default: una frase. Temático: 2-3 frases citando orphan_ratio real.",
    "en": "Close in EN, same structure."
  },
  "cta": {
    "label": {
      "es": "Ver la edición completa en abrimos.info →",
      "en": "See the full edition on abrimos.info →"
    },
    "url": "https://abrimos.info/edicion/YYYY-MM-DD"
  },
  "footer": {
    "pcn_note": {
      "es": "Cada cifra de este correo lleva un enlace directo al dataset original del Banco Mundial. Es lo que llamamos PCN (Public Citation Network). Si una cita no aguanta el click, no la publicamos.",
      "en": "Every figure in this email links directly to the original World Bank dataset. We call this PCN (Public Citation Network). If a citation doesn't survive the click, we don't publish it."
    },
    "methodology_link": "https://abrimos.info/metodologia",
    "license_note": {
      "es": "Abrimos.info — agencia de noticias para datos de desarrollo. Open source, GPLv3. Gratis para newsrooms y NPOs en países en desarrollo, siempre.",
      "en": "Abrimos.info — news agency for development data. Open source, GPLv3. Free for newsrooms and NPOs in developing countries, always."
    }
  },
  "quality": {
    "Q1":  "[OK|FAIL] — claim_tokens del ES preservados literal en EN (mismo CLAIM_ID, valor adaptado a locale EN)",
    "Q2":  "[OK|FAIL] — todos los noticia_id citados existen en §7 (o §8 si is_dry_day = true)",
    "Q3":  "[OK|FAIL] — verification_trace_ok = true para hero, todas las featured y orphan; ninguna pieza con false fue incluida",
    "Q4":  "[OK|FAIL] — subject.es entre 60-75 chars; subject.en entre 60-75 chars; ninguno empieza con cifra; ninguno usa emoji ni signos de exclamación",
    "Q5":  "[OK|FAIL] — preheader.es y preheader.en ≤ 110 chars; ninguno repite el hecho del subject",
    "Q6":  "[OK|FAIL] — diversidad país (solo scope = LAC): ningún country_iso aparece más de 2 veces entre hero + featured + orphan",
    "Q7":  "[OK|FAIL] — orphan tiene bonus_orphan > 0 en el pool de §7/§8; el hero NO es la pieza con mayor bonus_orphan (o, si lo es, se documenta en _metadata)",
    "Q8":  "[OK|FAIL] — hero.lede_absorbed 60-90 palabras (tres frases); hero.story_excerpt 60-90 palabras; orphan.lede_absorbed 60-90 palabras; orphan.story_excerpt 60-90 palabras",
    "Q9":  "[OK|FAIL] — close.type coincide con orphan_ratio: 'default' si < 0,40; 'thematic' si ≥ 0,40. Si 'thematic', la proporción citada en close.es y close.en es literalmente verdadera",
    "Q10": "[OK|FAIL] — todos los cta_link y enlaces markdown a Data360 son válidos; todas las cifras heredadas mantienen su claim token; ninguna URL fue inventada",
    "Q11": "[OK|FAIL] — ningún campo contiene imperativo de marketing ('suscríbete', 'no te pierdas', 'haz click', 'descúbrelo'); ningún campo nombra aliados (Animal Político, Quinto Elemento Lab, Ojoconmipisto, etc.)",
    "Q12": "[OK|FAIL] — todos los bloques presentes: edition, subject, preheader, greeting, hero, featured (≥ 2, ≤ 3, salvo is_dry_day), orphan, close, cta, footer. Si is_dry_day = true, featured puede estar ausente",
    "Q13": "[OK|FAIL] — siglas spelled out en primera mención por cada campo (BM, WJP, FMI, PCN, PIB, etc.); voz activa por defecto"
  },
  "_metadata": {
    "orphan_ratio": 0.0,
    "selected_from_pool_size": 0,
    "dry_day_fallback_used": false,
    "diversity_skips": [],
    "hero_is_top_orphan": false,
    "close_type": "default | thematic"
  }
}
```

## Notas de uso

- El **renderer del email** lee este JSON y aplica el template HTML/MJML correspondiente al `edition.scope`. Vive fuera del prompt (en `lib/render/newsletter.mjml.js`).
- Los claim tokens `{{claim:CLAIM_ID|valor}}` se resuelven en render: el valor aparece como texto visible + ancla `<sup>` que enlaza al PCN inline (mismo patrón que en piezas individuales).
- El campo `_metadata` **no se renderiza al lector**; vive en logs (`logs/newsletter/YYYY-MM-DD.jsonl`) para análisis posterior y debugging del scoring.
- Quality checks Q1-Q13 son **self-reported por el LLM**. El validador upstream (`lib/validators/newsletter.js`) duplica los chequeos mecánicos (longitudes, presencia de bloques, formato de URLs); los chequeos semánticos (Q11 imperativos, Q13 siglas) quedan al LLM hasta que se construya el regex check correspondiente.
- Si cualquier `quality.QX = FAIL`, el envío se bloquea y la edición pasa a revisión manual.

## Convenciones de naming en el JSON

- `country_iso` siempre en formato **ISO 3166-1 alpha-3** (`MEX`, `HND`, `COL`).
- `noticia_id` con prefijo `N` + 5 dígitos zero-padded (`N00427`).
- `dataset_id` literal del catálogo Data360 (`WJP_ROL`, `IT.NET.USER.RURAL.ZS`, etc.).
- `claim_id` formato `{COUNTRY}_{DATASET_SHORT}_{YEAR}` o variante upstream; el editor del newsletter solo los hereda.
- `date_iso` formato `YYYY-MM-DD`.
- `orphan_ratio` numérico, 0.0 a 1.0, dos decimales.

## Ejemplo de salida válida — ver

[[Operación_Abrimos.info/1. Projects/Data360 Challenge/Notas/2026-05-27 Prompts newsletter/ejemplo-output|ejemplo-output.md]] (a crear cuando exista la primera edición real).

Mientras tanto, ver el borrador renderizado en la sesión de Claudian del 2026-05-27 donde se cerró este prompt.
