import { useNavigate } from "react-router-dom"
import { Button } from "../components/Button";
import { auth } from "../firebase/config";
import { useState } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { ToastContainer, toast } from 'react-toastify';
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword } from "firebase/auth";
export const Landing = () => {

  const [email, setEmail] = useState('');

  const provider = new GoogleAuthProvider();
  const [password, setPassword] = useState('');
  async function signup() {
    toast.info(" mic test  ?  ")
    // how to add timer ; 
    // to do remove auth from the toast 
    let userId;
    try {
      userId = await createUserWithEmailAndPassword(auth, email, password);
    } catch (e : any ) {
      console.log(e);
      console.log("error hai upar wala");
      toast.error(e.code    );
      console.log(e.code);
      return;
    }

    if (!userId || !userId.user) {
      toast.error("Could not create user");
      return;
    }

    toast.loading("sending email ");
    try {
      await sendEmailVerification(userId.user);
      toast.dismiss();
      toast.success("Verification email sent!", {
        position: "top-center"
      });
    } catch (e) {
      toast.dismiss();
      console.error("Failed to send verification email", e);
      toast.error("Failed to send verification email");
    }








  }
  async function Google() {


    signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;
        // The signed-in user info.
        const user = result.user;
        // IdP data available using getAdditionalUserInfo(result)

        // ...
      }).then(() => { toast.success("signin with google done "); navigate("/game") }).catch((error) => {
        // Handle Errors here.
        toast.error("error   while  the login with google ")
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
      });

  }
  async function Signin() {
    let a ;   
    try {
       a = await signInWithEmailAndPassword(auth, email, password);

    }catch(e : any ){
      toast.error(e.code);

    }
   
    console.log(a.providerId);
    console.log(a + "this is a ");


    if (!a?.user.emailVerified) {
      toast.warn("Please verify your email first!");
      sendEmailVerification(a.user).then(() => {
        toast("email send to your gmail");

      });

      return;
    }

    toast.success('welcome back user ', {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored"

    });
    setTimeout(() => {
      navigate("/game");
    }, 2000);



  }

  const navigate = useNavigate();
  return <div className="flex justify-center">
    <div className="pt-8 max-w-screen-lg">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex justify-center">
          <img src={"/chessboard.jpeg"} className="max-w-96" />
        </div>
        <div className="pt-16">
          <div className="flex justify-center">
            <h1 className="text-4xl font-bold text-white">Play chess online on the #2 Site!</h1>
          </div >
          <input className="bg-blue-50 text-red-400" onChange={(e) => setEmail(e.target.value)} type="text" />
          <input className="bg-blue-50 text-green-400" onChange={(e) => setPassword(e.target.value)} type="text" />

          <div className="mt-8  ml-7 mr-4 flex justify-center">
            <Button onClick={signup}>
              login
            </Button>
            <Button onClick={Signin}>
              signin
            </Button>
            <br />
            <Button onClick={Google}>
              continue with google
            </Button>
            <ToastContainer
              position="bottom-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick={false}
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"

            />


          </div>
        </div>
      </div>
    </div>
  </div>
}