"use strict";


function showErr(err) {
   let spinner = document.getElementById("spinner");
   spinner.style.display = "none";
   console.log(err);
   alert(err.message);
}


function setMessage(message) {
   const spinner = document.getElementById("spinner");
   const messageDiv = document.getElementById("message");
   if (!message) {
      spinner.style.display = "none";
      messageDiv.style.display = "none";
   } else {
      spinner.style.display = "block";
      messageDiv.style.display = "block";
      messageDiv.innerHTML = message;
   }
}

function parseUnitOwlText(owlText) {
   setMessage("Parsing data...");
   const units = [];
   let unit = {
      Unit: "",
      Label: "",
      UCUM: "",
      Description: "",
      UnitType: ""
   };
   const allLines = owlText.split(/\r\n|\n/);
   allLines.forEach((line) => {
      if (line.substring(0, 5) === "unit:") {
         const id = line.substring(5);
         const href = '"https://qudt.org/vocab/unit/' + id + '.html"';
         const a = '<a href=' + href + '>' + id + '</a>';
         unit = {
            Unit: a,
            Label: "",
            UCUM: "",
            Description: "",
            UnitType: ""
         };
         units.push(unit);
      } else if (line.substring(0, 36) === "  qudt:hasQuantityKind quantitykind:" && !unit.UnitType) {
         unit.UnitType = line.substring(36, line.length - 2);
      } else if (line.substring(0, 27) === "  qudt:plainTextDescription" && !unit.Description) {
         unit.Description = line.substring(29, line.length - 3);
      } else if (line.substring(0, 15) === "  qudt:ucumCode" && !unit.UCUM) {
         let ucum = line.substring(17);
         ucum = ucum.substring(0, ucum.indexOf('"'));
         unit.UCUM = ucum;
      } else if (line.substring(0, 12) === "  rdfs:label" && !unit.Label) {
         let label = line.substring(14);
         label = label.substring(0, label.indexOf('"@'));
         unit.Label = label;
      }
   });
   return units;
}


function renderTable(units) {
   setMessage("Rendering table...");
   const table = document.getElementById("unitTable");
   table.style.display = "block";
   $("#unitTable").DataTable({
      data: units,
      columns: [{
         data: "Unit"
      },
      {
         data: "Label"
      },
      {
         data: "UCUM"
      },
      {
         data: "Description"
      },
      {
         data: "UnitType"
      }
      ],
      order: [
         [0, "asc"]
      ],
      paging: false
   });
   setMessage("");
}


function fetchUnits(qudtUnitListUri) {
   setMessage("Fetching data...");
   fetch(qudtUnitListUri)
      .then((response) => response.text())
      .then((owlText) => parseUnitOwlText(owlText))
      .then((units) => renderTable(units))
      .catch((err) => showErr(err));
}


window.onload = function () {
   const qudtUnitListUri = "https://qudt.org/2.1/vocab/unit";  // not CORS friendly
   const githubUnitListUri = "https://raw.githubusercontent.com/qudt/qudt-public-repo/master/vocab/unit/VOCAB_QUDT-UNITS-ALL-v2.1.ttl";
   fetchUnits(githubUnitListUri);
};
