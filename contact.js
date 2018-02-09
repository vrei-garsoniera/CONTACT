/ http://marplo.net
// Functia care formeaza codul anti-spam, dintr-un numar preluat ca milisecunde din data curenta
function set_codas() {
  var data = new Date();
  var mili_s = (data.getMilliseconds()>10) ? data.getMilliseconds() : 12;
  var re = mili_s.toString()+Math.ceil(mili_s/11);

  // Adauga codul in campul ascuns din formular si in textul vizibil
  document.mailer.anti_spam.value = re;
  document.getElementById('codas').innerHTML = re;

  return re;
}

var cod_as = set_codas();		// Executa functia pt. crearea codului anti-spam
document.getElementById('div_as').style.display = 'block';	// Face vizibila zona pt. cod de verificare

// Functia pentru preluarea si verificarea datelor din formular
function Validate() {
  var formular = document.mailer;

  // Preia datele din formular
  var file_php = formular.action;
  file_php = file_php.split('/').pop();		// Retine doar partea cu numele si extensia fisierului php
  var numele = formular.nume.value;
  var emailul = formular.email.value;
  var subiectul = formular.subiect.value;
  var mesajul = formular.mesaj.value;
  var cod_as = formular.anti_spam.value;
  var cod_as1 = formular.anti_spam1.value;

  // Verifica completarea campurilor din formular
  if (numele.length<2 || numele.length>40) {
	alert('Numele trebuie sa contina intr 2 si 40 caractere');
	formular.nume.focus();
  }
  else if (emailul.length<6 || emailul.indexOf("@")==-1 || emailul.indexOf('.')==-1) {
	alert('Adaugati corect adresa dv. de e-mail');
	formular.email.focus();
  }
  else if (subiectul.length<3 || subiectul.length>70) {
	alert('Completati subiectul, minim 3 caractere si maxim 70');
	formular.subiect.focus();
  }
  else if (mesajul.length<3 || mesajul.length>500) {
	alert('Scrieti mesajul, minim 5 caractere si maxim 500');
	formular.mesaj.focus();
  }
  else if(cod_as!=cod_as1) {
    alert('Cod de verificare incorect');
	formular.anti_spam1.focus();
  }
  else {
  // Creaza datele care trebuie trimise la ajax (fisierul.php cu datele catre el)
  var  datele = 'nume='+numele+'&email='+emailul+'&subiect='+subiectul+'&mesaj='+mesajul+'&anti_spam='+cod_as+'&anti_spam1='+cod_as1;
  ajaxrequest(file_php, datele);		// Apeleaza ajaxrequest()
  }

  return false;
}

// Functia care verifica si creaza obiectul XMLHttpRequest in functie de browser
function get_XmlHttp() {
  // Creaza variabila care va contine instanta la XMLHttpRequest, initial cu valoare nula
  var xmlHttp = null;

  if(window.XMLHttpRequest) {		// Daca browser-ul e Forefox, Opera, Safari, ...
    xmlHttp = new XMLHttpRequest();
  }
  else if(window.ActiveXObject) {	// Daca browser-ul este Internet Explorer
      xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
  }

  return xmlHttp;
}

// Functia care trimite datele la un fisier PHP si returneaza raspunsul
function ajaxrequest(php_file, datele) {
  var cerere_http =  get_XmlHttp();		// Apeleaza functia pt. crearea instantei la obiectul XMLHttpRequest

  set_codas();		// Executa functia pt. crearea (schimbarea) codului anti-spam

  cerere_http.open("POST", php_file, true);			// Creaza cererea

  // Adauga un Header specific pentru ca datele sa fie recunoscute ca au fost trimise prin POST
  cerere_http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  cerere_http.send(datele);		// Efectueaza trimiterea cererii, impreuna cu valorile care trebuie transmise

  // Verifica starea cererii
  // Daca raspunsul e primit complet, il transfera in eticheta HTML cu id-ul din "tagID"
  cerere_http.onreadystatechange = function() {
    if (cerere_http.readyState == 4) {
	  // Daca raspunsul de la script contine 'Eroare:' il afiseaza in titlu din formular
	  // Altfel, il afiseaza in locul formularului
	  if(cerere_http.responseText.indexOf("Eroare:")!=-1) {
	    document.getElementById('fc_titlu').innerHTML = cerere_http.responseText;
	  }
	  else {
	    document.mailer.innerHTML = cerere_http.responseText;
	  }
    }
  }
  return false;
}
