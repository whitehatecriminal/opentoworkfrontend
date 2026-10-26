import { redirect } from "next/navigation";

export default function AppliedRedirect() {
  redirect("/my-applications?tab=applied");
}
