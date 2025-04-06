import { useState, useEffect } from "react";
import { useUserAuth } from "./UserAuthcontext";

const useLoggedinuser = () => {
  const [loggedinuser, setLoggedinuser] = useState([]);
  const { user } = useUserAuth();

  useEffect(() => {
    if (user && user.email) {
      fetch(`http://localhost:5000/loggedinuser?email=${user.email}`)
        .then((res) => res.json())
        .then((data) => setLoggedinuser(data))
        .catch((err) => console.error("Error fetching logged-in user:", err));
    }
  }, [user]);

  return [loggedinuser];
};

export default useLoggedinuser;