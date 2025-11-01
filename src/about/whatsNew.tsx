function WhatsNew() {
    return <>
        <p className="pageTitle">O aplikacji</p>
        <ul className="richText">
            <h1>Co nowego w aplikacji</h1>
            <p className="label"><b>Wersja 0.4.5</b></p>
            <ul>
                <li>Wprowadzenie tekstowych opisów pilności zadań (zamiast liczbowych)</li>
                <li>Wprowadzenie reakcji na wykonane czynności</li>
                <li>Drobne poprawki interfejsu użytkownika</li>
            </ul>

            <p className="label"><b>Wersja 0.4.6</b></p>
            <ul>
                <li>Dodanie wyświetlania statystyk miesięcznych, dziennych i dla wybranego dnia</li>
                <li>Poprawne wyświetlanie wyniku procentowego w przypadku, jeśli w danym dniu nikt nie wykonał żadnej pracy</li>
            </ul>

            <p className="label"><b>Wersja 0.4.4</b></p>
            <ul>
                <li>Poprawienie błędu wczytywania się strony startowej</li>
            </ul>

            <p className="label"><b>Wersja 0.4.3</b></p>
            <ul>
                <li>Możliwość zainstalowania jako aplikacji na telefonie</li>
            </ul>

            <p className="label"><b>Wersja 0.4.2</b></p>
            <ul>
                <li>Wyświetlanie statystyk zdobytych punktów doświadczenia</li>
                <li>Nowa sekcja: O aplikacji</li>
            </ul>

            <p className="label"><b>Wersja 0.4.1</b></p>
            <ul>
                <li>Dodanie tła do ikonek szablonów czynności dla lepszej czytelności</li>
                <li>Dodanie nowego szablonu czynności: rozpakowywanie zakupów Frisco</li>
                <li>Dodanie możliwości filtrowania zleceń (wszystkie/niewykonane)</li>
                <li>Poprawionych kilka błędów</li>
            </ul>

            <p className="label"><b>Wersja 0.3.2</b></p>
            <ul>
                <li>Wprowadzenie zależności pomiędzy czynnościami a zleceniami</li>
                <li>Dodanie statusu zlecenia: wykonane lub niewykonane</li>
                <li>Ulepszona nawigacja między listą czynności a listą zleceń</li>
                <li>Kilka poprawionych błędów aplikacji</li>
            </ul>

            <p className="label"><b>Wersja 0.3.1</b></p>
            <ul>
                <li>Tworzenie, edycja, usuwanie i przeglądanie zleceń</li>
            </ul>

            <p className="label"><b>Wersja 0.2</b></p>
            <ul>
                <li>Automatyczne wypełnianie pola "osoba" podczas tworzenia nowej czynności</li>
                <li>Tworzenie szynności na podstawie szablonów</li>
                <li>Poprawki interfejsu użytkownika</li>
            </ul>

            <p className="label"><b>Wersja 0.1</b></p>
            <ul>
                <li>Tworzenie kont, logowanie się i wylogowywanie się</li>
                <li>Dodawanie nowej czynności</li>
                <li>Wyświetlanie szczegółów wykonanej czynności</li>
                <li>Wyświetlanie listy wykonanych czynności</li>
            </ul>

        </ul>
    </>
}

export default WhatsNew;