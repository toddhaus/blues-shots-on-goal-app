 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a//dev/null b/README.md
index 0000000000000000000000000000000000000000..0bd6f4abf4f1e4092d061c1f4b4be53c4bb53c49 100644
--- a//dev/null
+++ b/README.md
@@ -0,0 +1,41 @@
+# Blues Shots on Goal App
+
+A simple scoreboard written in React and TypeScript for tracking shots on goal and goals during a hockey game. The app uses Vite for development and bundling.
+
+## Prerequisites
+
+- **Node.js** 18 or later
+- **npm** (comes with Node.js)
+
+## Development
+
+Install dependencies and start the development server:
+
+```bash
+npm install
+npm run dev
+```
+
+This runs the Vite development server with hot reloading.
+
+## Building
+
+To create a production build:
+
+```bash
+npm run build
+```
+
+## Previewing
+
+After building, you can preview the production build locally:
+
+```bash
+npm run preview
+```
+
+## Deployment & Contributing
+
+The build outputs static files in the `dist` directory. Deploy these files to any static hosting service or integrate them with your preferred deployment pipeline.
+
+Contributions are welcome! Feel free to open issues or submit pull requests with improvements or bug fixes.
 
EOF
)
