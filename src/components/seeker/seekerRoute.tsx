import { Route, Routes, useNavigate } from 'react-router'
import SeekerPage from './page'
import EventPage from './EventPage/page'
import HistoryPage from './HistoryPage/page'
import ProfileSeekerPage from './ProfileSeeker/page'
import TherapyChatPage from './TherapyChat/page'

import ProtectedRoutes, { RoleProtectedRoute } from '../../routes/protectedroutes'
import { useEffect } from 'react'
import SummaryPage from './TherapyMatchingForm/SummaryPage'
import TherapistSelection from './TherapyProfile/therapyConnector'
import { TherapistProfile } from './TherapyProfile/viewtherapist'

export default function SeekerRoute() {
  const nav = useNavigate()
  useEffect(()=>{
    const checkRole = () =>{
      const role = RoleProtectedRoute()
      if(role !== "seeker"){
        nav("/login",{replace:true})
      }
    }
    checkRole();
  },[])
  return (
    <>
  
    <Routes>
      <Route element={<ProtectedRoutes/>}>
          <Route path='/' element={<SeekerPage />} />
          <Route path='/events' element={<EventPage />} />
          <Route path='/history' element={<HistoryPage />} />
          <Route path='/profile' element={<ProfileSeekerPage />} />
          <Route path='/therapy-chat' element={<TherapyChatPage />} />
          <Route path='/patient-summary' element={<SummaryPage formData={{
            depression: '',
            anxiety: '',
            trauma: '',
            concern: '',
            interference: '',
            urgency: ''
          }} />} />
          <Route path='/connector' element={<TherapistSelection/>} />
          <Route path='/therapist/:accountId' element={<TherapistProfile/>} />
          TherapistProfile
          </Route>
    </Routes>
    </>
  )
}