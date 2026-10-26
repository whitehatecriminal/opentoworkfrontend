import { redirect } from "next/navigation";

export default function AppliedApplicationRedirect() {
  redirect("/my-applications?tab=applied");
}
