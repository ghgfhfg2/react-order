import React, { useState } from "react";
import { useForm } from "react-hook-form";
import firebase from "../firebase";

function Login() {
  const { register, errors, handleSubmit } = useForm({
    mode: "onChange",
  });
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await firebase
        .auth()
        .signInWithEmailAndPassword(data.email, data.password);
      setLoading(false);
    } catch (error) {
      setErrorFromSubmit(error.message);
      setLoading(false);
      setTimeout(() => {
        setErrorFromSubmit("");
      }, 5000);
    }
  };
  const [errorFromSubmit, setErrorFromSubmit] = useState("");
  const [loading, setLoading] = useState(false);
  return (
    <>
        <div className="join-form-wrap">
          <h2 className="title center">로그인</h2>
          <form className="join-form" onSubmit={handleSubmit(onSubmit)}>
            <input
              name="email"
              type="email"
              placeholder="이메일"
              ref={register({ required: true, pattern: /^\S+@\S+$/i })}
            />

            <input
              type="password"
              placeholder="비밀번호"
              name="password"
              ref={register({ required: true, minLength: 4 })}
            />
            {errors.password && errors.password.type === "required" && (
              <p>비밀번호를 입력해 주세요</p>
            )}
            {errors.password && errors.password.type === "minLength" && (
              <p>비밀번호는 4글자 이상이어야 합니다.</p>
            )}
            {errorFromSubmit && <p>{errorFromSubmit}</p>}
            <input type="submit" value="로그인" disabled={loading} />
          </form>
        </div>
    </>
  );
}

export default Login;
