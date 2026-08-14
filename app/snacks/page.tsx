import { redirect } from "next/navigation";

export default function SnacksPage() {
  redirect("/?log=snack");
}
