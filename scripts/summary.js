/**
 * Zeigt die Begrüßung basierend der eingeloggten Uhrzeit an.
 * Erwartet einen String im Format "HH:MM" (z. B. "14:30").
 * Wandelt die Zeit in eine Zahl (z. B. 1430) um und gibt je nach Uhrzeit zurück:
 * - "Good Morning" für Zeiten von 00:00 Uhr bis 12:00 Uhr
 * - "Good Afternoon" für Zeiten zwischen 12:00 und 17:59 Uhr
 * - "Good Evening" für Zeiten ab 18:00 Uhr bis Mitternacht
 */
function greet(the_time) {
  let this_time = the_time.split(":");
  let combined = this_time[0].concat(this_time[1]);
  let timeNumber = parseInt(combined, 10);

  if (timeNumber < 1200) {
    return "Good Morning";
  } else if (timeNumber < 1800) {
    return "Good Afternoon";
  } else {
    return "Good Evening";
  }
}

/**
 * Gibt abhängig von der aktuellen Uhrzeit die passende Begrüßung zurück.
 * Vormittag → "Good morning,"
 * Nachmittag → "Good afternoon,"
 * Abend → "Good evening,"
 * Wird später beim Login automatisch aufgerufen,
 * sobald ein User eingeloggt ist.
 */
function greetNow(refDate = new Date()) {
  const hours = refDate.getHours();
  if (hours < 12) return "Good morning,";
  if (hours < 18) return "Good afternoon,";
  return "Good evening,";
}

/**
 * Schreibt die Begrüßung und den Usernamen auf die Summary-Seite.
 * Aktuell noch mit Platzhalter-Name, 
 * später kommt hier der Name aus Firebase rein.
 */
function renderGreeting(userName, refDate) {
  const greetingText = document.getElementById("greeting_text");
  const greetingName = document.getElementById("greeting_name");
  if (!greetingText || !greetingName) return;

  greetingText.textContent = greetNow(refDate);
  greetingName.textContent = userName;
}
