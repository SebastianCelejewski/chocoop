function reportError(message: string, cause?: any) {
    const errorGuid = crypto.randomUUID();
    
    console.log(errorGuid + ": " + message)
    
    if (cause !== undefined) {
        console.log(errorGuid + ": " + cause)
    }
    
    alert("Wystąpił błąd. Powiadom twórcę aplikacji wysyłając mu ten identyfikator błędu: " + errorGuid)
    return message;
}

export default reportError;