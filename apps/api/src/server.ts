import { env } from "./config/env";
import { app } from "./app";

app.listen(env.API_PORT, () => {
  console.log(`Inventario TI API ouvindo na porta ${env.API_PORT}`);
});
