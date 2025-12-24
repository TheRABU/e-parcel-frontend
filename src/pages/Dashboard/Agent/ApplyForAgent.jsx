const ApplyForAgent = () => {
  return (
    <>
      <div>
        <h1 className="text-3xl font-bold text-center mt-10">
          Apply for Agent
        </h1>
        <div className="flex justify-center items-center mt-6">
          <p>Apply for Agent</p>
        </div>
        <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
          <div className="card-body">
            <form>
              <fieldset className="fieldset">
                <label className="label">Email</label>
                <input type="email" className="input" placeholder="Email" />
                <label className="label">Password</label>
                <input
                  type="password"
                  className="input"
                  placeholder="Password"
                />
                <div>
                  <a className="link link-hover">Forgot password?</a>
                </div>
                <button className="btn btn-neutral mt-4">Login</button>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ApplyForAgent;
