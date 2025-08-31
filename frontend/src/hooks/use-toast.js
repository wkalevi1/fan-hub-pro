import { toast as baseToast } from "sonner";

export function useToast() {
  return { toast: baseToast };
}
export const toast = baseToast;
export default useToast;
