
    $(document).ready( function() {
        //$('#tblist').DataTable();
        //console.log(myChart);

    });

    var tagToSave = {};

    window.onload = function () {

        var text = document.getElementById('example5-event');

        var availableTagsStr = document.getElementById('tagsId').value;
        var availableTags = JSON.parse( availableTagsStr );

        var taggle = new Taggle('taggerArea',{
            placeholder: 'Type your favorite type of juice... (hint: match, training)',
            onTagAdd: function(event, tag) {
                text.innerHTML = 'You just added ' + tag;
                tagToSave[tag] = "toto";
            },
            allowedTags: availableTags // ['match','training']
        });

        var container = taggle.getContainer();
        var input = taggle.getInput();

        $(input).autocomplete({
            source: availableTags, // See jQuery UI documentaton for options
            appendTo: container,
            position: { at: "left bottom", of: container },
            select: function(event, data) {
                event.preventDefault();
                //Add the tag if user clicks
                if (event.which === 1) {
                    taggle.add(data.item.value);
                }
            }
        });






    }
    validateForm = function( athleteId  ) {

        alert("athleteId:" + athleteId);

        var videoName = document.forms["myForm"]["videoName"].value;
        if (videoName == "") {
            alert("videoName must be filled out");
            return false;
        }
        var videoUrl = document.forms["myForm"]["videoUrl"].value;
        if (videoUrl == "") {
            alert("videoUrl must be filled out");
            return false;
        }
        isEmpty = function (obj){
            return Object.keys(obj).length === 0;
        }
        if ( isEmpty( tagToSave ) ){
            alert("Tag must be filled out");
            return false;

        }
        alert("Tag to save :" + JSON.stringify(tagToSave));

        var tags = [];
        for(var key in tagToSave){
            var value = tagToSave[key];
            tags.push ( key );

        }

        var timeInMs = Date.now();

        var data =
            {
                bucket: "video",
                id: videoName,
                tags: tags,
                score: timeInMs
            }

        var datastr = JSON.stringify(data);
        const req = new XMLHttpRequest();
        req.open('POST', '/video/athlete/' + athleteId + '/add/id/' + data.bucket + '/' + data.id  + '?score=' + data.score + "&tags=" + JSON.stringify(tags), false);
        req.setRequestHeader( "Content-Type", "application/json"  );
        req.send(datastr);

        if (req.status === 200) {
            console.log("Réponse reçue: %s", req.responseText);
            //draw( req.responseText, datatype );
        } else {
            console.log("Status de la réponse: %d (%s)", req.status, req.statusText);
        }


        return false;

        //alert("validateForm");
        //return false;
        /*
          var params= {};
          params.fileid =  fileid;
          params.respmode = "base";
          var data = JSON.stringify(params);
          //var params = "fileid="+fileid;
          const req = new XMLHttpRequest();

          //req.open('GET', 'http://www.mozilla.org/', true);
          req.open('POST', objectiveId + '/view', false);
          req.setRequestHeader( "Content-Type", "application/json"  );
          req.send(data);

          if (req.status === 200) {
             console.log("Réponse reçue: %s", req.responseText);
             draw( req.responseText, datatype );
          } else {
             console.log("Status de la réponse: %d (%s)", req.status, req.statusText);
          }
          */


    }
