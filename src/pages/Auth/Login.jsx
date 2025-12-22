import { Link } from "react-router";
import imgBackground from "../../assets/login.svg";

const Login = () => {
  return (
    <>
      <div className="flex justify-center items-center">
        <div className="h-screen flex flex-col items-center justify-center">
          <h1 className="text-3xl font-bold text-center mt-10">Login Page</h1>

          <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4 mx-auto py-10 mt-6">
            <label className="label">Email</label>
            <input type="email" className="input" placeholder="Email" />

            <label className="label">Password</label>
            <input type="password" className="input" placeholder="Password" />

            <button className="bg-red-500 text-white mt-4 py-2 w-full rounded-4xl font-semibold">
              Login
            </button>

            <span className="font-semibold">
              New here ? <Link to="/register">Register now</Link>
            </span>
          </fieldset>
        </div>
        <div className="min-h-screen hidden md:block md:w-1/2 overflow-hidden">
          <img className="w-full h-full" src={imgBackground} alt="" />
        </div>
      </div>
    </>
  );
};

export default Login;
