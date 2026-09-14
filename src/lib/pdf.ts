export function escapeHtml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function printHtml(html: string) {
  const iframe = document.createElement('iframe');
  iframe.style.visibility = 'hidden';
  iframe.style.position = 'absolute';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow?.document;
  if (!iframeDoc) return;

  iframeDoc.open();
  iframeDoc.write(html);
  iframeDoc.close();

  iframe.contentWindow?.focus();
  setTimeout(() => {
    iframe.contentWindow?.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }, 500);
}

const PDF_STYLES = `
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; line-height: 1.5; padding: 20px; }
    h1 { color: #0891b2; font-size: 24px; border-bottom: 2px solid #cffafe; padding-bottom: 10px; margin-bottom: 5px; }
    .subtitle { color: #64748b; font-size: 14px; margin-bottom: 30px; }
    .section { border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px; page-break-inside: avoid; }
    .section h2 { color: #0f172a; font-size: 18px; margin-top: 0; margin-bottom: 15px; display: flex; align-items: center; gap: 10px; }
    .badge { display: inline-block; background: #cffafe; color: #0891b2; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: bold; }
    .field { margin-bottom: 15px; }
    .field-label { font-weight: 600; color: #475569; font-size: 13px; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
    .field-value { background: #f8fafc; padding: 10px 15px; border-radius: 8px; border: 1px solid #f1f5f9; white-space: pre-wrap; font-size: 14px; }
    .tags { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 5px; }
    .tag { background: #e0f2fe; color: #0284c7; padding: 4px 10px; border-radius: 16px; font-size: 13px; border: 1px solid #bae6fd; }
  </style>
`;

export function downloadDiagnosticPdf(data: any, userEmail: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Diagnóstico Digital</title>
        ${PDF_STYLES}
      </head>
      <body>
        <h1>Maratona Tech 9°C — Diagnóstico Digital</h1>
        <div class="subtitle">Aluno/Grupo: ${escapeHtml(userEmail)} | Data: ${new Date().toLocaleDateString()}</div>

        <div class="section">
          <h2><span class="badge">Cabeçalho</span> Informações Gerais</h2>
          <div class="field">
            <div class="field-label">Nome do Grupo</div>
            <div class="field-value">${escapeHtml(data.group_name)}</div>
          </div>
          <div class="field">
            <div class="field-label">Conteúdo Analisado</div>
            <div class="field-value">${escapeHtml(data.content_analyzed)}</div>
          </div>
          <div class="field">
            <div class="field-label">Área do Conhecimento</div>
            <div class="field-value">${escapeHtml(data.knowledge_area)}</div>
          </div>
        </div>

        <div class="section">
          <h2><span class="badge">1</span> Descrição Objetiva do Problema</h2>
          <div class="field-value">${escapeHtml(data.problem_description)}</div>
        </div>

        <div class="section">
          <h2><span class="badge">2</span> Dados Envolvidos</h2>
          <div class="field">
            <div class="field-label">Tipos de Dados</div>
            <div class="tags">${(data.data_types || []).map((t: string) => `<div class="tag">${escapeHtml(t)}</div>`).join('')}</div>
          </div>
          <div class="field">
            <div class="field-label">Quais dados específicos?</div>
            <div class="field-value">${escapeHtml(data.data_which)}</div>
          </div>
          <div class="field">
            <div class="field-label">Como são usados?</div>
            <div class="field-value">${escapeHtml(data.data_usage)}</div>
          </div>
        </div>

        <div class="section">
          <h2><span class="badge">3</span> Papel do Algoritmo</h2>
          <div class="field">
            <div class="field-label">O que ele influencia?</div>
            <div class="tags">${(data.algorithm_influence || []).map((t: string) => `<div class="tag">${escapeHtml(t)}</div>`).join('')}</div>
          </div>
          <div class="field">
            <div class="field-label">Explicação</div>
            <div class="field-value">${escapeHtml(data.algorithm_explain)}</div>
          </div>
        </div>

        <div class="section">
          <h2><span class="badge">4</span> Riscos Identificados</h2>
          <div class="field">
            <div class="field-label">Risco Informacional</div>
            <div class="field-value">${escapeHtml(data.risk_informacional)}</div>
          </div>
          <div class="field">
            <div class="field-label">Risco Emocional</div>
            <div class="field-value">${escapeHtml(data.risk_emocional)}</div>
          </div>
          <div class="field">
            <div class="field-label">Risco Social</div>
            <div class="field-value">${escapeHtml(data.risk_social)}</div>
          </div>
        </div>

        <div class="section">
          <h2><span class="badge">5</span> Causa do Problema</h2>
          <div class="field">
            <div class="field-label">Tipos de Causas</div>
            <div class="tags">${(data.cause_types || []).map((t: string) => `<div class="tag">${escapeHtml(t)}</div>`).join('')}</div>
          </div>
          <div class="field">
            <div class="field-label">Explicação da Causa</div>
            <div class="field-value">${escapeHtml(data.cause_explain)}</div>
          </div>
        </div>

        <div class="section">
          <h2><span class="badge">6</span> Estratégias</h2>
          <div class="field">
            <div class="field-label">Estratégia Profissional</div>
            <div class="field-value">${escapeHtml(data.strategy_professional)}</div>
          </div>
          <div class="field">
            <div class="field-label">Estratégia Escola</div>
            <div class="field-value">${escapeHtml(data.strategy_school)}</div>
          </div>
        </div>
      </body>
    </html>
  `;
  printHtml(html);
}

export function downloadCoexistencePdf(data: any, userEmail: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Guia de Convivência</title>
        ${PDF_STYLES.replace(/#0891b2/g, '#0d9488').replace(/#cffafe/g, '#ccfbf1').replace(/#0284c7/g, '#0f766e').replace(/#e0f2fe/g, '#d1fae5')}
      </head>
      <body>
        <h1 style="color: #0d9488; border-color: #ccfbf1;">Maratona Tech 9°C — Guia de Convivência</h1>
        <div class="subtitle">Aluno/Grupo: ${escapeHtml(userEmail)} | Data: ${new Date().toLocaleDateString()}</div>

        <div class="section">
          <h2><span class="badge" style="background:#ccfbf1; color:#0d9488;">Cabeçalho</span> Informações Gerais</h2>
          <div class="field">
            <div class="field-label">Nome do Grupo</div>
            <div class="field-value">${escapeHtml(data.group_name)}</div>
          </div>
          <div class="field">
            <div class="field-label">Conteúdo Analisado</div>
            <div class="field-value">${escapeHtml(data.content_analyzed)}</div>
          </div>
        </div>

        <div class="section">
          <h2><span class="badge" style="background:#ccfbf1; color:#0d9488;">1</span> Descrição do Problema Digital</h2>
          <div class="field-value">${escapeHtml(data.problem_description)}</div>
        </div>

        <div class="section">
          <h2><span class="badge" style="background:#ccfbf1; color:#0d9488;">2</span> Identificação da Causa</h2>
          <div class="field-value">${escapeHtml(data.cause_identification)}</div>
        </div>

        <div class="section">
          <h2><span class="badge" style="background:#ccfbf1; color:#0d9488;">3</span> Riscos para a Escola</h2>
          <div class="field-value">${escapeHtml(data.risks_school)}</div>
        </div>

        <div class="section">
          <h2><span class="badge" style="background:#ccfbf1; color:#0d9488;">4</span> Estratégias de Conscientização</h2>
          <div class="field-value">${escapeHtml(data.awareness_strategies)}</div>
        </div>

        <div class="section">
          <h2><span class="badge" style="background:#ccfbf1; color:#0d9488;">5</span> Propostas Práticas de Mitigação</h2>
          <div class="field-value">${escapeHtml(data.mitigation_proposals)}</div>
        </div>
      </body>
    </html>
  `;
  printHtml(html);
}
