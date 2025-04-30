import { useEffect } from "react"
import { useState } from "react"
import { useParams } from "react-router-dom"

export default function IssuePage(){

    const {projectId} = useParams()

    const [issues, setIssues] = useState([])

    const fetchIssues = () => {

    }

    useEffect(() => {
        fetchIssues()
    }, [])

    return (
        <div>

        </div>
    )
}