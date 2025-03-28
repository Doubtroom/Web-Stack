import React, { useEffect, useState } from 'react'
import { useMemo } from 'react'
import {useSelector} from 'react-redux'
import { useNavigate } from 'react-router-dom'

function Protected({children,authentication=true}) {
    const reduxAuthStatus=useSelector((state)=>state.auth.status)
    
    const navigate=useNavigate()
    const [loader,setLoader]=useState(true)

    const authStatus = useMemo(() => {
        return localStorage.getItem("authStatus") === "true" || reduxAuthStatus;
      }, [reduxAuthStatus]);

      useEffect(() => {
        const isLogout = window.history.state && window.history.state.usr?.fromLogout;
      
        if (!isLogout) {
          if (authentication && authStatus !== authentication) {
            navigate('/landing');
          } else if (!authentication && authStatus !== authentication) {
            navigate('/');
          }
        }
        setLoader(false);
      }, [authStatus, authentication, navigate]);

    return loader?null:<>{children}</>
}

export default Protected