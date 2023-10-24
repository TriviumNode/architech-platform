import { useEffect } from "react";
import { useRevalidator, useRouteError } from "react-router-dom";
import { useUser } from "../Contexts/UserContext";

export default function ErrorPage() {
  const { user } = useUser();
  const revalidator = useRevalidator()
  const error: any = useRouteError();
  console.error(error);

  // Reload collection data after login
  useEffect(()=>{
    console.log('Checking Effect')
    if (!user) return;
    console.log('Running Effect')
    revalidator.revalidate()
  }, [user])

  return (
    <div id="error-page">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>{error.statusText || error.message}</i>
      </p>
    </div>
  );
}