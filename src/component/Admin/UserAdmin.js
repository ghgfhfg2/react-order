import React, {useState, useEffect} from 'react'
import firebase from "../../firebase";
import { Table, Button } from 'antd';

function UserAdmin() {
  const [TotalUser, setTotalUser] = useState();
  const [ReRender, setReRender] = useState(false)
  useEffect(() => {
    let userArr = [];
    firebase
    .database()
    .ref("users")
    .on("value", (snapshot) => {
      snapshot.forEach(el=>{
        userArr.push({
          uid:el.key,
          auth:el.val().auth ? el.val().auth : "",
          call_number:el.val().call_number,
          email:el.val().email,
          name:el.val().name,
          part:el.val().part,
          role:el.val().role
        })
      })
      setTotalUser(userArr);
    });
    return () => {      
    }
  }, []);

  const deleteUser = (uid) => {
    console.log(uid)
    const confirm = window.confirm('해당 유저를 DB에서 삭제하시겠습니까?');
    if(confirm){
      firebase.database().ref(`users/${uid}`)
      .remove()
      firebase.database().ref(`users/lunch/user/${uid}`)
      .remove()
      alert('삭제되었습니다.')
      setReRender(!ReRender);
    }
  }

  

  const columns = [    
    {
      title: '이름',
      dataIndex: 'name',
    },
    {
      title: '부서',
      dataIndex: 'part'
    },
    {
      title: 'uid',
      dataIndex: 'uid',
    },
    {
      title: '이메일',
      dataIndex: 'email'
    },
    {
      title: '전화번호',
      dataIndex: 'call_number'
    },
    {
      title: 'role',
      dataIndex: 'role'
    },
    {
      title: 'auth',
      dataIndex: 'auth'
    },
    {
      title: '관리',
      dataIndex: 'uid',
      render: uid => <Button onClick={()=>{deleteUser(uid)}}>삭제</Button>
    }
    
  ]
  
  const data = TotalUser;

  function onChange(pagination, filters, sorter, extra) {
    fetch({
      sortField: sorter.field,
      sortOrder: sorter.order
    })
    console.log('params', pagination, filters, sorter, extra);
  }


  return (
    <> 
      <Table 
        columns={columns} 
        dataSource={data} 
        onChange={onChange} 
        pagination={{ pageSize: 100 }}
      />
    </>
  )
}


export default UserAdmin
