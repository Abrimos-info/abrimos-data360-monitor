'use strict';

(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.D360ChatExport = api;
  }
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function pad(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function isoStamp(date) {
    var d = date || new Date();
    return d.getUTCFullYear() + '-'
      + pad(d.getUTCMonth() + 1) + '-'
      + pad(d.getUTCDate()) + 'T'
      + pad(d.getUTCHours()) + ':'
      + pad(d.getUTCMinutes()) + 'Z';
  }

  function fileStamp(date) {
    var d = date || new Date();
    return d.getUTCFullYear() + '-'
      + pad(d.getUTCMonth() + 1) + '-'
      + pad(d.getUTCDate());
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function defaultLabels(lang) {
    if (lang === 'en') {
      return {
        exported: 'Exported',
        focus: 'Country focus',
        user: 'User',
        assistant: 'Assistant',
        sources: 'Sources',
        indicators: 'Indicators consulted',
        data360_yes: 'Used Data360 data',
        data360_no: 'Did not query Data360',
        no_sources: 'No tools — model response only',
        tool_failed: 'failed',
      };
    }
    return {
      exported: 'Exportado',
      focus: 'Países foco',
      user: 'Usuario',
      assistant: 'Asistente',
      sources: 'Fuentes',
      indicators: 'Indicadores consultados',
      data360_yes: 'Usó datos Data360',
      data360_no: 'No consultó Data360',
      no_sources: 'Sin tools — solo respuesta del modelo',
      tool_failed: 'falló',
    };
  }

  function formatTraceLine(trace, labels, toolLabel) {
    if (!trace || !trace.length) return labels.no_sources;
    return trace.map(function (t) {
      var lbl = (toolLabel && toolLabel(t.name)) || t.name || 'tool';
      var src = t.source ? ' · ' + t.source : '';
      var mark = t.ok ? '' : ' (' + labels.tool_failed + ')';
      return lbl + src + mark;
    }).join(' → ');
  }

  function formatIndicators(indicators) {
    if (!indicators || !indicators.length) return '';
    return indicators.map(function (ind) {
      var name = ind.name && ind.name !== ind.idno ? ind.name + ' (' + ind.idno + ')' : ind.idno;
      var url = ind.url || ((window.D360Urls && window.D360Urls.indicatorSearchUrl)
        ? window.D360Urls.indicatorSearchUrl(ind.idno)
        : ('https://data360.worldbank.org/en/indicator/' + encodeURIComponent(ind.idno)));
      return '- [' + name + '](' + url + ')';
    }).join('\n');
  }

  function buildConversationMarkdown(turns, options) {
    options = options || {};
    var lang = options.lang || 'es';
    var labels = Object.assign(defaultLabels(lang), options.labels || {});
    var title = options.title || 'Data360 News Agent — Chat';
    var exportedAt = options.exportedAt || isoStamp();
    var lines = [
      '# ' + title,
      '',
      '**' + labels.exported + ':** ' + exportedAt + ' UTC',
    ];

    if (options.focusCountries && options.focusCountries.length) {
      lines.push('**' + labels.focus + ':** ' + options.focusCountries.join(', '));
    }

    lines.push('');

    (turns || []).forEach(function (turn, index) {
      if (index > 0) lines.push('---', '');
      lines.push('## ' + labels.user, '', String(turn.user || '').trim(), '');
      lines.push('## ' + labels.assistant, '', String(turn.assistant || '').trim(), '');
      lines.push('### ' + labels.sources, '', formatTraceLine(turn.trace, labels, options.toolLabel), '');
      lines.push(turn.usedData360 ? labels.data360_yes : labels.data360_no, '');
      var indBlock = formatIndicators(turn.indicators);
      if (indBlock) {
        lines.push('### ' + labels.indicators, '', indBlock, '');
      }
    });

    return lines.join('\n').trim() + '\n';
  }

  function downloadText(filename, text) {
    var blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.rel = 'noopener';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  function copyText(text) {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        var ok = document.execCommand('copy');
        ta.remove();
        if (ok) resolve();
        else reject(new Error('copy failed'));
      } catch (err) {
        reject(err);
      }
    });
  }

  function printStyles() {
    return [
      'body { font-family: Georgia, "Times New Roman", serif; color: #111; line-height: 1.5; margin: 24px; max-width: 780px; }',
      'h1 { font-size: 22px; margin: 0 0 8px; }',
      'h2 { font-size: 16px; margin: 24px 0 8px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }',
      'h3 { font-size: 13px; margin: 16px 0 6px; color: #444; text-transform: uppercase; letter-spacing: 0.04em; }',
      'p, li { font-size: 12px; }',
      'pre, code { font-family: ui-monospace, monospace; font-size: 11px; }',
      'pre { background: #f6f6f6; padding: 10px; border-radius: 4px; overflow: auto; }',
      'hr { border: none; border-top: 1px solid #ddd; margin: 24px 0; }',
      '.meta { color: #555; font-size: 11px; margin-bottom: 20px; }',
      '.trace { font-size: 11px; color: #333; }',
      '.d360-md-sparkline { border: 1px solid #ddd; padding: 8px; margin: 12px 0; }',
      '@media print { body { margin: 12mm; } }',
    ].join('\n');
  }

  function printConversationPdf(markdown, options) {
    if (typeof window === 'undefined') return;
    options = options || {};
    var markedFn = (typeof marked !== 'undefined' && marked.parse) ? marked.parse.bind(marked) : null;
    var bodyHtml = markedFn
      ? markedFn(String(markdown || ''), { gfm: true, breaks: false })
      : '<pre>' + escapeHtml(markdown) + '</pre>';
    var title = options.title || 'Data360 News Agent — Chat';
    var win = window.open('', '_blank');
    if (!win) throw new Error('popup blocked');
    win.document.open();
    win.document.write('<!DOCTYPE html><html lang="' + escapeHtml(options.lang || 'es') + '"><head><meta charset="utf-8">'
      + '<title>' + escapeHtml(title) + '</title><style>' + printStyles() + '</style></head><body>'
      + bodyHtml + '</body></html>');
    win.document.close();
    win.focus();
    setTimeout(function () {
      win.print();
    }, 350);
  }

  return {
    isoStamp: isoStamp,
    fileStamp: fileStamp,
    buildConversationMarkdown: buildConversationMarkdown,
    downloadText: downloadText,
    copyText: copyText,
    printConversationPdf: printConversationPdf,
  };
}));
