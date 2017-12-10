
    $(document).ready( function() {
        //$('#tblist').DataTable();
        //console.log(myChart);

    });

    var tagToSave = {};
    var taggle;


    var currentTags;
    var currentIdSelected;



    window.onload = function () {

        //fatherOnLoad();
        var currentathlete = document.getElementById('currentathleteId').value;
        executeOperation(currentathlete);
        console.log("onload");



    }



    reloadTags = function ( availableTags ){

        var text = document.getElementById('tagger-event');

        var authorisedTagsStr = document.getElementById('tagsId').value;
        var authorisedTags = JSON.parse( authorisedTagsStr );



        if ( taggle ){
            for ( var i = 0; i<currentTags.length; i++ ){
                var tag = currentTags[i];
                taggle.remove ( tag );

            }
            //taggle= null;
            taggle.removeAll();
            for ( var i = 0; i<availableTags.length; i++ ){
                var tag = availableTags[i];
                taggle.add ( tag );

            }

        }else {

            currentTags = availableTags;
            taggle = new Taggle('taggerArea', {
                tags: availableTags,
                onTagRemove: function (event, tag) {
                    delete tagToSave[tag];

                    var currentathlete = document.getElementById('currentathleteId');
                    //executeOperation(currentathlete);

                },
                onTagAdd: function (event, tag) {

                    tagToSave[tag] = "toto";
                    var currentathlete = document.getElementById('currentathleteId');
                    //executeOperation(currentathlete);
                },
                //allowedTags: authorisedTags // ['match','training']

            });
            var container = taggle.getContainer();
            var input = taggle.getInput();

            $(input).autocomplete({
                source: authorisedTags, // See jQuery UI documentaton for options
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






    }
    executeOperation = function ( athleteId ){



        var timeInMs = Date.now();

        var data =
            {
                bucket: "video",

            }

        var datastr = JSON.stringify(data);
        const req = new XMLHttpRequest();
        req.open('GET', '/video/athlete/' + athleteId + '/getAllIds/allids/' + data.bucket , false);
        req.setRequestHeader( "Content-Type", "application/json"  );
        req.send(datastr);

        if (req.status === 200) {
            console.log("Réponse reçue: %s", req.responseText);
            if ( req.responseText ){
                //draw( req.responseText, datatype );

                if ( req.responseText ){
                    var dataTab = [];
                    var datas = JSON.parse( req.responseText );
                    //var datas = result.items;
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
    var table;
    createTable = function ( data ){
        console.log("createTable: %s", data);
        var dataSet = JSON.parse( data );

        if (table) {

            table.clear().draw();
            table.rows.add(dataSet); // Add new data
            table.columns.adjust().draw(); // Redraw the DataTable
        }

        //var table = $('#listvideosId').DataTable();

        //table
        //    .clear()
        //    .draw();

        //if ( dataSet.length > 0 ){
        table =  $('#listvideosId').DataTable( {
            destroy: true,
            data: dataSet,
            //"order": [[ 1, "desc" ]],
            columns: [
                { title: "video" }


            ],

        } );
        $('#listvideosId tbody').off( 'click', 'tr');

        $('#listvideosId tbody').on( 'click', 'tr', function () {
            console.log( "click" );
            //table.row('.selected');


            var tab = table.row(this).data();

            var data =
                {
                    bucket: "video",
                    id: tab[0],

                }
            currentIdSelected = data.id;
            var currentathlete = document.getElementById('currentathleteId').value;
            var datastr = JSON.stringify(data);
            const req = new XMLHttpRequest();
            req.open('GET', '/video/athlete/' + currentathlete + '/getAllTags/id/' + data.bucket + "/" + data.id , false);
            req.setRequestHeader( "Content-Type", "application/json"  );
            req.send(datastr);

            if (req.status === 200) {
                console.log("Réponse reçue: %s", req.responseText);
                if ( req.responseText ){


                    if ( req.responseText ){
                        var dataTab = [];
                        var datas = JSON.parse( req.responseText );
/*
                        if ( datas ){
                            for ( var i = 0; i<datas.length; i++ ){
                                var data = datas[i];
                                var tab = [];
                                tab.push(data);
                                dataTab.push(tab);


                            }
                            reloadTags( dataTab );
                        }
*/

                        reloadTags( datas );

                    }
                }
            } else {
                console.log("Status de la réponse: %d (%s)", req.status, req.statusText);
            }



        } );



        //}



    }

    /**
     * @TODO
     */

    updateTags = function( athleteId  ) {

        //alert("updateTags athleteId:" + athleteId);


        var currentathlete = document.getElementById('currentathleteId').value;

        if ( !currentathlete || !currentIdSelected ){
            return;
        }


        var tags = [];
        for(var key in tagToSave){
            //var value = tagToSave[key];
            tags.push ( key );

        }

        var timeInMs = Date.now();

        var data =
            {
                bucket: "video",
                id: currentIdSelected,
                tags: tags,
                score: timeInMs
            }

        var datastr = JSON.stringify(data);
        const req = new XMLHttpRequest();
        req.open('POST', '/video/athlete/' + currentathlete + '/add/id/' + data.bucket + '/' + data.id  + '?score=' + data.score + "&tags=" + JSON.stringify(tags), false);
        req.setRequestHeader( "Content-Type", "application/json"  );
        req.send(datastr);

        if (req.status === 200) {
            console.log("Réponse reçue: %s", req.responseText);
            //draw( req.responseText, datatype );
        } else {
            console.log("Status de la réponse: %d (%s)", req.status, req.statusText);
        }


        return false;




    }
