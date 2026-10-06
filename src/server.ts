import { app } from "./app.js";
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Authentication Service is running on http://localhost:${PORT}`);
});
