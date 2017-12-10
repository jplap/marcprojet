
    $(document).ready( function() {
        //$('#tblist').DataTable();
        //console.log(myChart);

    });

    var tagToSave = {};
    var taggle;
    var taggleReserved;
    var currentOperationRequired = "inter";


    window.onload = function () {

        //fatherOnLoad();

        // onclick vs. onchange
        var trans = document.forms['transForm'].elements['trans'];

        for (var i=0, len=trans.length; i<len; i++) {
            trans[i].onclick = function() {
                //document.getElementById('display1').innerHTML += '<br />' + this.value  + ' clicked';
                currentOperationRequired = this.value;
                var currentathlete = document.getElementById('currentathleteId');
                executeOperation  ( currentathlete );
            };

            trans[i].onchange = function() {
                //document.getElementById('display1').innerHTML += '<br />' + this.value  + ' changed';
            };
        }

        reloadTags();




    }
    reloadTags = function (){

        var text = document.getElementById('tagger-event');

        var availableTagsStr = document.getElementById('tagsId').value;
        var availableTags = JSON.parse( availableTagsStr );

        if ( taggle ){
            for ( var i = 0; i<availableTags.length; i++ ){
                var tag = availableTags[i];
                taggle.remove ( tag );

            }
            taggle= null;
        }

        taggle = new Taggle('taggerArea',{
            tags: availableTags,
            onTagRemove: function(event, tag) {
                delete tagToSave[tag];
                taggleReserved.add(tag);
                var currentathlete = document.getElementById('currentathleteId');
                executeOperation  ( currentathlete );

            },
            onTagAdd: function(event, tag) {

                tagToSave[ tag  ]= "toto";
                var currentathlete = document.getElementById('currentathleteId');
                executeOperation  ( currentathlete );
            }

        });
        for ( var i = 0; i<availableTags.length; i++ ){
            var tag = availableTags[i];
            tagToSave[ tag  ]= "toto";

        }

        // Reserved
        if ( taggleReserved ){
            for ( var i = 0; i<availableTags.length; i++ ){
                var tag = availableTags[i];
                taggleReserved.remove ( tag );

            }

        }
        taggleReserved = new Taggle('taggerAreaReserved',{
            //tags: availableTags,
            onTagAdd: function(event, tag) {
                console.log( "taggleReserved onTagAdd:" + tag);
                //text.innerHTML = 'You just added ' + tag;





            },

            onTagRemove: function(event, tag) {

                taggle.add(tag);
            },



        });


        /*
        var container = taggleReserved.getContainer();
        var input = taggleReserved.getInput();

        for (var i=0; i<l.length; i++)
         {
          l[i].addEventListener('click', function() {alert('add any function in place of this alert!');},false);
         }

         */




    }
    executeOperation = function ( athleteId ){

        //alert("athleteId:" + athleteId);


        isEmpty = function (obj){
            return Object.keys(obj).length === 0;
        }
        if ( isEmpty( tagToSave ) ){
            //alert("Tag must be filled out");
            return false;

        }
        //alert("Tag to save :" + JSON.stringify(tagToSave));

        var tags = [];
        for(var key in tagToSave){
            var value = tagToSave[key];
            tags.push ( key );

        }

        var timeInMs = Date.now();

        var data =
            {
                bucket: "video",

            }

        var datastr = JSON.stringify(data);
        const req = new XMLHttpRequest();
        req.open('GET', '/video/athlete/' + athleteId + '/getTags/tags/' + data.bucket + '?type=' + currentOperationRequired + "&tags=" + JSON.stringify(tags), false);
        req.setRequestHeader( "Content-Type", "application/json"  );
        req.send(datastr);

        if (req.status === 200) {
            console.log("Réponse reçue: %s", req.responseText);
            if ( req.responseText ){
                //draw( req.responseText, datatype );

                if ( req.responseText ){
                    var dataTab = [];
                    var result = JSON.parse( req.responseText );
                    var datas = result.items;
                    if ( datas ){
                        for ( var i = 0; i<datas.length; i++ ){
                            var data = datas[i];
                            var tab = [];
                            tab.push(data);
                            dataTab.push(tab);


                        }
                        createTable( JSON.stringify(dataTab) );
                    }
                }
            }
        } else {
            console.log("Status de la réponse: %d (%s)", req.status, req.statusText);
        }


        return false;



    }
    createTable = function ( data ){
        console.log("createTable: %s", data);
        var dataSet = JSON.parse( data );

        //var table = $('#listvideosId').DataTable();

        //table
        //    .clear()
        //    .draw();

        //if ( dataSet.length > 0 ){
        $('#listvideosId').DataTable( {
            destroy: true,
            data: dataSet,
            //"order": [[ 1, "desc" ]],
            columns: [
                { title: "video" }


            ],
            /*
            "createdRow": function( row, data, dataIndex ) {

            }
            */
        } );



        //}



    }