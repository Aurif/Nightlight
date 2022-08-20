import { forGuild } from "./core/init";
import { TestModule } from "./modules";

forGuild("123")
  .use(TestModule({intervals: [1000, 700]}));