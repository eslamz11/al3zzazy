import { createFileRoute } from "@tanstack/react-router";
import { processImageUpload } from "@/server-functions/uploadImage";

export const Route = createFileRoute("/api/upload-image")({
  server: {
    handlers: {
      POST: async ({ request, context }) => {
        return processImageUpload(request, context as any);
      },
    },
  },
});
