import React, { useState, useEffect } from 'react'
import { Button } from 'antd'
import { Link } from 'react-router-dom'
import firebase from "../../firebase";

function Research() {
  const [ResearchList, setResearchList] = useState()
  useEffect(() => {
    let arr = [];
    firebase.database().ref('research')
    .once("value")
    .then((snapshot) => {
      snapshot.forEach(el=>{
        arr.push(el.val())
      })
      console.log(arr)
      setResearchList(arr)
    })
    return () => {
      
    }
  }, [])
  return (
    <>
      <table>
        <thead>
          <tr>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {ResearchList && ResearchList.map((el,idx) => (
          <tr key={idx}>
            <td><Link to={{
              pathname: `/research_view`,
              state: {
                uid:el.uid
              }
            }}
            >{el.title}</Link></td>
          </tr>
          ))}
        </tbody>
      </table>
      <Button>
        <Link to="/research_write">작성</Link>
      </Button>
    </>
  )
}

export default Research
