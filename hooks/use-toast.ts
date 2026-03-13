import { toast as sonnerToast } from "sonner";

export function toast(props: { title?: string; description?: string; variant?: "default" | "destructive" }) {
  if (props.variant === "destructive") {
    sonnerToast.error(props.title, { description: props.description });
  } else {
    sonnerToast(props.title, { description: props.description });
  }
}

export function useToast() {
  return { toasts: [] as never[], toast, dismiss: () => {} };
}
