/*
* factory for postgresql backend
*/

/**
 *
 *
 usrapp = dati utente e applicazione per il futuro posso sempre verificare se utente puo eseguire query
 queryf = query da eseguire
 parameters = array parametri  [nome]= valore
 xsltsheet = style sheet da applicare default 00-transparent
 output = json / xml / xslt  default json xslt risponde xml ma trasformato
 log = true/false se registrare  o no richiesta default false
 *
 * es: ajaxFactory.query2xmljson($scope.UrlPar.WXAP_ID, 'selectOrdini', parameters, null, null, true);
 * es: ajaxFactory.query2xmljson($scope.UrlPar.WXAP_ID, 'selectOrdini', null, null, null, true);
 * chiamata completa

 var parameters = [];
 parameters['numero']= 465;
 parameters['sringa']= 'parola';
 parameters['variab']= $scope.anno1;
 ajaxFactory.query2xmljson
 ($scope.UrlPar.WXAP_ID,'selectOrdini', null, null, null, false,
 function (data){
 console.log(data);
 });

 oppure

 ajaxFactory.query2xmljson
 ($scope.UrlPar.WXAP_ID,'totaliordini', null, null, null, false,
 function (data){
 console.log(data.xml[0]);
 });

 * */
mainApp.factory('ajaxFact', function($http, $location) {
    /*
     * calcolo percorsi
     * relHref ricorda riferito a disco non http
     */
    
    // absHref = $location.$$protocol + '://' + $location.$$host + '/tms-assist-02.00/';
    absHref = $location.$$protocol + '://' + serverRoot ;
    // relHref = $location.$$absUrl.split('#')[0].replace($location.$$protocol + '://' + $location.$$host, '..');
    relHref = '..'+appBase;

    /**
     * normalizza il parametro passato per pgsql senza '
     * toglie spazi inizio e fine e sostituisce
     * le entity
     &lt;	<	less than
     &gt;	>	greater than
     &amp;	&	ampersand
     &apos;	'	apostrophe
     &quot;	"	quotation mark
     *
     * prima raddoppio ' per postgresql
     *
     */
    pgNormStr = function(str) {

        if (str == undefined || str == null) {
            str = "NULL";
        } else if ( !isNaN(str) ) {     // se non è un numero
            str += "";
            if (str.trim() == ""){
                str = "NULL";
            }
        } else {
            str = str+"";
            str = str.trim().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "''").replace(/'/g, "&apos;").replace(/"/g, "&quot;");
        }
        return str;
    };

    return {
        // serve per i percorsi nelle varie funzioni
        absHref : absHref,
        relHref : relHref,

        query2xmljson : function(usrapp, pathf, queryf, parameters, xsltsheet, output, log, callback) {

            var paramxml = "";

            if (!xsltsheet)
                xsltsheet = '00-transparent';
            else
                xsltsheet += ".xslt";
            if (!output)
                output = 'json';
            if (!log)
                log = false;

            if (parameters) {
                for (var nome in parameters) {
                    /*
                     * controllo se parametro si chiama CDATA_... qualcosa lo prendo come passato e come cdata
                     */
                    if (nome.indexOf("CDATA_") > -1) {
                        paramxml += "<" + nome + "><![CDATA[" + parameters[nome] + "]]></" + nome + ">";
                    } else {
                        paramxml += "<" + nome + ">" + pgNormStr(parameters[nome]) + "</" + nome + ">";
                    }
                }
            }

            xmlpar = "<xml>";
            xmlpar += "<parameters>";
            xmlpar += paramxml;
            xmlpar += "</parameters></xml>";

            // se path null prendo quella applicazione
            if (!pathf)
                pathf = relHref;

            $http.post(absHref + '/ajax/query2xmljson-03.00.php', {
                usrapp : usrapp,
                pathf : pathf,
                queryf : queryf + ".sql",
                xmlpar : xmlpar,
                xsltsheet : xsltsheet + ".xslt",
                output : output,
                log : log
            }).success(function(data) {
                callback(data);
            });

        },

        /*
         * chiama una determinata procedura php con i parametri forniti
         * per il momento restituisce json
         */

        proc2xmljson : function(usrapp, pathf, procf, parameters, xsltsheet, output, log, callback) {

            var paramxml = "";

            if (!xsltsheet)
                xsltsheet = '00-transparent';
            else
                xsltsheet += ".xslt";
            if (!output)
                output = 'json';
            if (!log)
                log = false;

            if (parameters) {
                for (var nome in parameters) {
                    /*
                     * controllo se parametro si chiama CDATA_... qualcosa lo prendo come passato e come cdata
                     * !!! non mette le virgolette sul parametro
                     */
                    if (nome.indexOf("CDATA_") > -1) {
                        paramxml += "<" + nome + "><![CDATA[" + parameters[nome] + "]]></" + nome + ">";
                    } else {
                        paramxml += "<" + nome + ">" + parameters[nome] + "</" + nome + ">";
                    }
                }
            }

            xmlpar = "<xml>";
            xmlpar += "<parameters>";
            xmlpar += paramxml;
            xmlpar += "</parameters></xml>";

            // se path null prendo quella applicazione
            if (!pathf)
                pathf = relHref;

            $http.post(absHref + '/ajax/proc2xmljson-03.00.php', {
                usrapp : usrapp,
                pathf : pathf,
                procf : procf + ".php",
                xmlpar : xmlpar,
                xsltsheet : xsltsheet,
                output : output,
                log : log
            }).success(function(data) {
                callback(data);
            });

        }
    };

});
