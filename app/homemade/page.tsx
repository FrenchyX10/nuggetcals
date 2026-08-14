import { redirect } from "next/navigation";

export default function HomemadePage() {
  redirect("/?log=homemade");
}
