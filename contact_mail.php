<?php
session_start();

/** Aici completati cu datele dv. **/

$to = 'adresa_dv@de.mail';      // Adresa de e-mail la care va fi trimis mesajul

// Daca doriti sa folositi serverul SMTP de la GMail, dati la $gmail valoarea 1 
// Adaugati la $gmail_user adresa dv. de GMail (care va fi folosita pt. server SMTP) si parola ei la $gmail_pass
// Daca doriti sa folositi serverul pt. mail unde este incarcat acest script, lasati $gmail=0, iar $gmail_user si $gmail_pass cum e
$gmail = 0;
$gmail_user = 'contul_dv@gmail.com';
$gmail_pass = 'parola_gmail';


/** In continuare nu e nevoie sa modificati **/

// Verifica sesiune ce limiteaza trimiterea de cel mult un mail la 5 minute (300 secunde), utila si anti-refresh
if(isset($_SESSION['limit_contact']) && $_SESSION['limit_contact']>(time()-300)) exit('Se poate trimite cel mult un mesal la 5 minute.<br />Mai asteptati '.($_SESSION['limit_contact']-time()+300).' secunde');

// Verifica daca e primit si corect codul de verificare (in caz ca trece de scriptul JavaScript)
if(isset($_POST['anti_spam']) && !empty($_POST['anti_spam']) && isset($_POST['anti_spam1']) && $_POST['anti_spam']==$_POST['anti_spam1']){
  // Verifica dacca sunt primite prin post toate datele necesare
  if(isset($_POST['nume']) && isset($_POST['email']) && isset($_POST['subiect']) && isset($_POST['mesaj'])){
  $_POST = array_map('trim', $_POST);    // Sterge posibile spatii exterioare din date
  $_POST = array_map('strip_tags', $_POST);  // Elimina cu "strip_tags()" posibile taguri

  // Preia datele din formularul HTML
  $nume = $_POST['nume'];
  $email = $_POST['email'];
  $subiect = $_POST['subiect'];
  $mesaj = $_POST['mesaj'];
  $body = 'E-mail de pe site, trimis de: '.$nume. PHP_EOL .' Adresa lui /ei de e-mail: '. $email. PHP_EOL .PHP_EOL
    .'Mesaj: '.$mesaj;

  // Daca $gmail=1, trimite mesajul cu functia gmail_sender(), din fisierul "gmail.php", care foloseste PhpMailer
  // Altfel, trimite mesajul cu functia mail() locala, a serverului
  if($gmail===1){
    include('gmail/gmail.php');    // Include fisierul cu functia gmail_sender()

    // Apeleaza si preia rezultatul functiei gmail_sender()
    $send = gmail_sender($to, $gmail_user, $gmail_pass, $subiect, $body, $email, $nume);
  }
  else {
    $from = 'From: '. $email;
    // Apeleaza functia PHP mail(), daca trimite cu succes seteaza $send='trimis', altfel defineste 'Eroare:'
    if(mail($to, $subiect, $body, $from))  $send = 'trimis';
    else $send = 'Eroare: Serverul nu a putut expedia mesajul prin e-mail';
  }

  // Daca mesajul a fost trimis ( $send e setat 'trimis';), afiseaza mesaj de confirmare
  // Altfel, returneaza eroarea
    if($send=='trimis'){
    // Seteaza o sesiune prin care se blocheaza re-trimiterea mesajului la un eventual refresh sau mai curand de 5 minute
    $_SESSION['limit_contact'] = time();

      $re = '<p>Stimate/a <b>'.$nume.'</b>, mesajul dv. a fost trimis cu succes, veti primi raspuns cat mai curand.</p>
      <p>Va multumim pentru interesul acordat.</p>
            <p>Daca doriti, vizitati: <a href="http://marplo.net">MarPlo.net</a></p>';
    }
    else $re = $send;
  }
  else $re = 'Eroare: Campuri de formular netransmise.';
}
else $re = 'Eroare: Cod de verificare incorect';

echo $re;
