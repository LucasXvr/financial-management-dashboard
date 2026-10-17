# Instruções para agentes

Estas instruções se aplicam a todo o repositório.

## Testes e regressão

- Siga integralmente a política permanente em [`.cursor/rules/test-regression-policy.mdc`](.cursor/rules/test-regression-policy.mdc).
- Toda correção de bug deve receber teste de regressão automatizado quando tecnicamente viável.
- Toda funcionalidade nova deve incluir testes adequados às regras implementadas.
- Não remova, ignore ou enfraqueça testes para aprovar uma alteração.
- Execute as verificações relevantes antes de concluir uma tarefa.
- Antes de publicar, execute toda a suíte obrigatória e interrompa o processo se houver falhas.
- Se uma validação não puder ser automatizada ou executada, registre a limitação, a validação manual e o risco residual.
- O relatório final deve listar alterações, bugs, testes criados ou atualizados, resultados, testes não executados e riscos.
