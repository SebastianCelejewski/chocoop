import { useNavigate } from "react-router";

export function useActivityListActions() {
    const navigate = useNavigate();
    
    function createActivity() {
        const navLink = `/ActivityEdit/create`
        navigate(navLink)
    }

    function showActivity(id: string) {
        const navLink = `/ActivityDetails/${id}`
        navigate(navLink)
    }

    function navigateToWorkRequests() {
        const navLink = `/WorkRequestList`
        navigate(navLink)
    }

    return {
        createActivity,
        showActivity,
        navigateToWorkRequests
    };
}