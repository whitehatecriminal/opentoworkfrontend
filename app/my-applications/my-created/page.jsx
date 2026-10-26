import { redirect } from "next/navigation";

export default function MyCreatedRedirect() {
  redirect("/my-applications?tab=my-created");
}
