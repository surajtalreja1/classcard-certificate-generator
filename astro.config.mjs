import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  base: "/free-tools/certificates",
  output: "server",
  // Astro's dev toolbar sits bottom-centre and would cover the preview toolbar.
  devToolbar: { enabled: false },
  adapter: cloudflare({
    imageService: "passthrough",
  }),
});
