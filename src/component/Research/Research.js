import React, { useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import { Button } from 'antd';
import { Link } from 'react-router-dom'
import firebase from "../../firebase";

function Research() {
  const currentUser = useSelector((state) => state.user.currentUser);
  const [UserDb, setUserDb] = useState();
  const [ResearchList, setResearchList] = useState()
  const [ReRender, setReRender] = useState(false)
  useEffect(() => {
    if(currentUser){  
      firebase
      .database()
      .ref("users")
      .child(currentUser.uid)
      .on("value", (snapshot) => {
        setUserDb(snapshot.val());
      });
    }
    let arr = [];
    firebase.database().ref('research')
    .once("value")
    .then((snapshot) => {
      snapshot.forEach(el=>{
        arr.push(el.val())
      })
      setResearchList(arr)
    })
    return () => {
      
    }
  }, [ReRender])

  const onDelete = (uid) => {
    let a = window.confirm('이 게시물을 삭제 하시겠습니까?')
    if(a){
      firebase.database().ref(`research/${uid}`)
      .remove()
      setReRender(!ReRender)
    }
  }
  
  return (
    <>
      <ul className="board-basic research">        
          {ResearchList && ResearchList.map((el,idx) => (
            <li key={idx} className={el.auth && UserDb && UserDb.role < 3 ? 'none' : ''}>
              <div className="info-box">
                <span className="subject">
                  <Link to={{
                    pathname: `/research_view`,
                    state: {
                      uid:el.uid
                      }
                    }}
                    >{el.title}
                  </Link>
                </span>
              </div>
              {UserDb && UserDb.auth == 'insa' && <Button onClick={()=>{onDelete(el.uid)}}>삭제</Button>}
            </li>
          ))}
      </ul>
      {UserDb && UserDb.auth === 'insa' &&
      <div style={{textAlign:"right",marginTop:"15px"}}>
        <Button style={{width:"100px"}} type="primary">
          <Link to="/research_write">게시물 등록</Link>
        </Button>
      </div>
      }
    </>
  )
}

export default Research
