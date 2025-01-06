import React from 'react'
import IssueListPage from './issues-list'
 
// promise gets the meetingId from the value given in [meetingId] i.e folder name - Lastest Next.js feature
type Props = {
    params: Promise<{meetingId: string}>
}

const MeetingDetailsPage = async ({params}: Props) => {

    const {meetingId} = await params
    return (
        <div>
        <IssueListPage meetingId={meetingId}/>
        </div>
    )
}

export default MeetingDetailsPage