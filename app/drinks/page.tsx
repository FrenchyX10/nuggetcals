import { redirect } from "next/navigation";

export default function DrinksPage() {
  redirect("/?log=drink");
}
