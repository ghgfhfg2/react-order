import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import firebase from "../firebase";

function Join() {
  const { register, handleSubmit, watch, errors } = useForm({
    mode: "onChange",
  });
  const [errorFromSubmit, setErrorFromSubmit] = useState("");
  const [loading, setLoading] = useState(false);

  const password = useRef();
  password.current = watch("password");
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      let createdUser = await firebase
        .auth()
        .createUserWithEmailAndPassword(data.email, data.password);
        console.log(createdUser)
        /*
        await createdUser.user.updateProfile({
          displayName: data.name,
          partName: data.part
        })
        //Firebase 데이터베이스에 저장해주기 
        await firebase.database().ref("user").child(createdUser.user.uid).set({
            name: user.name,
            part: user.part
        })
        */  

      setLoading(false);
    } catch (error) {
      setErrorFromSubmit(error.message);
      setTimeout(() => {
        setErrorFromSubmit("");
      }, 3000);
    }
  };
  

  watch("name");
  watch("email");
  watch("password");
  watch("password2");
  return (
    <>
      <h2 className="title center">회원가입</h2>
      <form className="join-form" onSubmit={handleSubmit(onSubmit)}>
        <input
          type="text"
          placeholder="이름"
          name="name"
          ref={register({ required: true })}
        />
        {errors.name && errors.name.type === "required" && (
          <p>이름을 입력해 주세요</p>
        )}
        <input
          name="email"
          type="email"
          placeholder="이메일"
          ref={register({ required: true, pattern: /^\S+@\S+$/i })}
        />
        {errors.email && errors.email.type === "required" && (
          <p>이메일을 입력해 주세요</p>
        )}
        {errors.email && errors.email.type === "pattern" && (
          <p>이메일 형식이 맞지 않습니다.</p>
        )}
        <select name="part" defaultValue="1" ref={register({ required: true })}>
          <option value="1" disabled hidden>
            부서
          </option>
          <option value="R&D">R&D</option>
          <option value="전략기획부">전략기획부</option>
          <option value="영업지원부">영업지원부</option>
          <option value="인사재경부">인사재경부</option>
          <option value="IT개발부">IT개발부</option>
          <option value="푸드킹">푸드킹</option>
          <option value="물류부">물류부</option>
        </select>
        {errors.part && <p>부서를 선택해 주세요</p>}
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
          <p>비밀번호는 최소 4글자이상 이어야 합니다.</p>
        )}
        <input
          type="password"
          placeholder="비밀번호 확인"
          name="password2"
          ref={register({
            required: true,
            validate: (value) => value === password.current,
          })}
        />
        {errors.password2 && errors.password2.type === "required" && (
          <p>비밀번호 확인을 입력해 주세요</p>
        )}
        {errors.password2 && errors.password2.type === "validate" && (
          <p>비밀번호가 일치하지 않습니다.</p>
        )}
        {errorFromSubmit && <p>{errorFromSubmit}</p>}
        <input type="submit" value="회원가입" disabled={loading} />
      </form>
    </>
  );
}

export default Join;
