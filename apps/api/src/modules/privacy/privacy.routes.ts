import { Router } from "express";

export const privacyRouter = Router();

privacyRouter.get("/purpose", (_request, response) => {
  response.json({
    data: {
      title: "Aviso de finalidade - Inventario TI",
      purpose:
        "Os dados pessoais sao tratados exclusivamente para controle interno de ativos de TI, atribuicao de equipamentos, gestao de termos de uso, auditoria operacional e atendimento a obrigacoes internas de seguranca.",
      dataMinimization:
        "O sistema deve coletar apenas dados necessarios para identificar o colaborador, seu vinculo operacional e os recursos corporativos sob sua responsabilidade.",
      sensitiveAccess:
        "Dados como IMEI, numero de chip e seriais tecnicos devem ser exibidos apenas para perfis Admin e TI.",
      retention:
        "Registros ativos devem ser mantidos enquanto houver equipamento ou recurso associado. Apos desligamento ou encerramento da finalidade, os dados devem ser anonimizados ou removidos conforme obrigacao de retencao aplicavel.",
      exportPolicy:
        "Exportacoes exigem confirmacao explicita, sao registradas em auditoria e devem conter apenas os campos necessarios ao relatorio solicitado."
    }
  });
});
