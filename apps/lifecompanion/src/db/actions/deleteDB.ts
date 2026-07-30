import { deleteDB } from "../core/database";
import { makeDBAction } from "../core/factories/action";

export default makeDBAction("deleteDB", async () => deleteDB());
