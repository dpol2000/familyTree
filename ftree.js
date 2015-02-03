// FamilyTree Javascript library v.1.1 (c) Dmitry Polinichenko 2015

function familyTree(persons, settings) {

    // thanks to Daniel James for this piece of code for IE < 9; see http://stackoverflow.com/a/144172
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (obj, fromIndex) {
            if (fromIndex == null) {
                fromIndex = 0;
            } else if (fromIndex < 0) {
                fromIndex = Math.max(0, this.length + fromIndex);
            }
            for (var i = fromIndex, j = this.length; i < j; i++) {
                if (this[i] === obj)
                    return i;
            }
            return -1;
        };
    }

    // we need this trick to see if something is an array or not
    Array.prototype.isArray = true;

    // default settings
    var defaultColor = '#111',
        defaultFillColor = '#eee',
        defaultMaleFillColor = '#57aaf7',
        defaultFemaleFillColor = '#f2bbc4',
        defaultMaleBorderColor = '#F00',
        defaultFemaleBorderColor = '#00F',
        defaultMouseoverMaleBorderColor = '#000',
        defaultMouseoverFemaleBorderColor = '#000',
        defaultStrokeColor = '#000',
        defaultStrokeWidth = 2,
        defaultMouseoverColor = '#ddd',
        defaultStartX = 100,
        defaultStartY = 100,
        defaultWidth = 150,
        defaultHeight = 150,
        defaultVDistance = 100,
        defaultHDistance = 100,
        defaultFontSize = '14',
        defaultBlur = false,
        defaultRadius = 20,
        defaultActivePerson = null,
        defaultActivePartner = null;

    this.generations = [];

    // converting id's to object pointers
    for (var i=0; i!=persons.length; i++) {
        
        if (!persons[i].partners) {
            persons[i].partners = [];
        }
        checkRelations(persons[i], persons);
    }

    checkReciprocity();
    
    initSettings(this);

    initArrays();

    var tree = buildTree(this.active_person, this.active_partner, persons);
    var sortedPersons = sort(tree);

    if (sortedPersons) {
        this.generations = sortedPersons;
    } else {
        return false;
    }

    invertPartners(this);
    invertParents(this);

    // if there are no persons to show, return -1
    if (this.generations.length === 0) {
       return false;
    }

   this.canvas = null;

   initHandlers(this);

    // public methods

    // hide a tree
    this.hide = function() {
        if (this.canvas) {
            this.canvas.remove();

            for (var i=0; i!=this.generations.length; i++) {
                for (var j=0; j!=this.generations[i].length; j++) {
                    if (this.generations[i][j].node) {
                        this.generations[i][j].node.node.remove();
                        this.generations[i][j].node.text.remove();
                    }
                }
            }
        }
    };

    // remove a person or a list of persons from the tree
    this.remove = function(persons) {

        // check if the argument is valid
        if (!persons) {
            console.log('trying to remove undefined or null');
            return 0;
        }

        // get a one-dimension array of all persons
        var all_persons = unSort.call(this);

         // check if the agrument is an array and it is not empty
        if (persons.isArray) {
            if (persons.length === 0) {
                console.log('trying to remove an empty array');
                return 0;
            }
        }
        else {
            // make an array from one person
            persons = [persons];
        }

        var index,
        counter = 0;

        // remove all the persons from array
        for (var i=0; i!=persons.length; i++) {
            index = all_persons.indexOf(persons[i]);
            // if the person is found, remove him/her from the array
            if (index !== -1) {
                all_persons.splice(index, 1);
                counter++;
            } else {
                console.log('trying to remove a non-existing person');
            }
        }

        // sort the array
        var sortedPersons = sort(all_persons);

        // save sorted persons to generations
        this.generations = sortedPersons;

        return counter;

    }

    // append a person or a set of persons to the tree
    this.append = function(persons) {

        // check if the argument is valid
        if (!persons) {
            console.log('trying to append undefined or null');
            return 0;
        }

        // get a one-dimension array of persons
        var all_persons = unSort.call(this);

        // check if the agrument is an array and it is not empty
        if (persons.isArray) {
            if (persons.length === 0) {
                console.log('trying to append an empty array');
                return 0;
            }
        } else {
            // make an array from one person
            persons = [persons];
        }

        // append all the persons from the array
        for (var i=0; i!=persons.length; i++) {
            all_persons.push(persons[i]);
        }

        // sort the array
        // save sorted persons to generations
        this.generations = sort(all_persons);

        return persons.length;
    }


    // show the family tree
    this.show = function () {

        var gen_coords = [],
            lengths = [],
            gen_add = [],
            max_length = 1,
            generations = this.generations,
            lines,
            cx,
            cy,
            fatherPlace,
            connectedPartners = [],
            global_this = this;


        // find max length of the generations chains in order to know the canvas' width
        for (var i=0; i!=generations.length; i++) {
            lengths.push(generations[i].length);
        }

        max_length = Math.max.apply(0, lengths);

        // get quantity of partners for each first node of a generation
        // we need it to set ...
        for (var i=0; i!=generations.length; i++) {
            if (generations[i].length > 1) {
                gen_add.push(generations[i][1].partners.length);
            } else {
                gen_add.push(0);
            }
        }

        // calculate coordinates of all nodes
        for (var i=0; i!= generations.length; i++) {
            gen_coords[i] = 20*gen_add[i] + (this.width + this.hDistance)/2 * (max_length - generations[i].length);
        }

        // remove all the existing Raphael objects
        if (this.canvas) {
            this.hide();
        }

        // set up canvas
        this.canvas = Raphael(
            this.startX,
            this.startY,
            max_length * (this.width + this.hDistance) + 20,
            (generations.length + 1) * (this.height + this.vDistance) + 20
        );

        //  draw all nodes and their connections from generations

        // loop through the generations
        for (var i=0; i!=generations.length; i++) {

            // draw all the nodes from current generation
            for (var j=0; j!= generations[i].length; j++) {

                // draw the node

                // absolute x and y coordinates of the node
                cx = gen_coords[i] + j * (this.width + this.hDistance);
                cy = i * (this.height + this.vDistance) + 20;

                this.generations[i][j].node = addNode.call(
                    this,
                    cx,
                    cy,
                    this.width,
                    this.height,
                    this.generations[i][j],
                    ''
                );

                // set mouse event handlers for the node
                generations[i][j].node.node.mouseover(this.onmouseover);
                generations[i][j].node.node.mouseout(this.onmouseout);
                generations[i][j].node.text.mouseover(this.onmouseover);
                generations[i][j].node.text.mouseout(this.onmouseout);

                if (generations[i][j].partners.length > 1) {
                    var userClick = this.generations[i][j].node.node.click;

                    // set onclick handler - we must redraw the tree
                    this.generations[i][j].node.node.click(function(){
                        userClick();
                        this.toFront();
                        this.text.toFront();
                        reDrawTree(this.person, null, global_this);
                    });

                    // draw old partners if they exist

                    var num_partner = 1;

                    // create 'shadow' partner nodes
                    for (var p=generations[i][j].partners.length-1; p>=0; p--) {

                        if (generations[i][j].partners[p].person !== generations[i][j].active_partner.person) {

                            if (this.generations[i][j].gender == 'male') {
                                this.generations[i][j].partners[p].node = addNode.call(
                                    this,
                                    cx + this.width + this.hDistance - 15*num_partner,
                                    cy - 15*num_partner,
                                    this.width,
                                    this.height,
                                    this.generations[i][j].partners[p].person,
                                    ''
                                );

                            } else {
                                this.generations[i][j].partners[p].node = addNode.call(
                                    this,
                                    cx - this.width - this.hDistance - 15*num_partner,
                                    cy - 15*num_partner,
                                    this.width,
                                    this.height,
                                    this.generations[i][j].partners[p].person,
                                    ''
                                );

                                this.generations[i][j].partners[p].node.node.toBack();
                                this.generations[i][j].partners[p].node.text.toBack();

                            }

                            var active_partner = this.generations[i][j];

                            this.generations[i][j].partners[p].node.node.mouseover(this.onmouseover);
                            this.generations[i][j].partners[p].node.node.mouseout(this.onmouseout);
                            this.generations[i][j].partners[p].node.text.mouseover(this.onmouseover);
                            this.generations[i][j].partners[p].node.text.mouseout(this.onmouseout);

                            this.generations[i][j].partners[p].node.node.active_partner = active_partner;
                            this.generations[i][j].partners[p].node.node.person = generations[i][j].partners[p].person;


                             // set onclick handler - we must redraw the tree
                            var userClick = this.generations[i][j].partners[p].node.node.click;

                            this.generations[i][j].partners[p].node.node.click(function(){
                                userClick();
                                this.toFront();
                                this.text.toFront();
                                reDrawTree(this.person, this.active_partner, global_this);
                            });

                            num_partner++;

                        }
                    }
                }

                // draw connection to partners
                if (generations[i][j].partners.length > 0) {

                    if (generations[i][j].partners.length > 1) {
                        partner = generations[i][j].active_partner.person;
                    } else {
                        partner = generations[i][j].partners[0].person;
                    }

                    // if partner is to the right
                    if (getPlace(partner, generations) > j) {
                        // a line to connect
                        lines = 'M ' + (cx + this.width) + ' ' + (cy + this.height/2) + ' h ' + this.hDistance;
                    } else {

                    }

                    this.canvas.path(lines).attr({"stroke-width": this.strokeWidth}).attr({"stroke": this.strokeColor});
                }

                // draw connection to parents
                if (generations[i][j].father) {

                    // a vertical line
                    lines = 'M ' + (cx + this.width/2) + ' ' + cy + ' v -' + this.vDistance/2;

                    // get parents' places in generations
                    fatherPlace = getPlace(generations[i][j].father, generations);

                    if (fatherPlace === -1) {
                        fatherPlace = getPlace(generations[i][j].mother, generations);
                    }

                    // diagonal lines to the center between the parents
                    lines = lines + ' L ' + (gen_coords[i-1] + (this.width + this.hDistance)*fatherPlace + this.width + this.hDistance/2);
                    lines = lines + ' ' + ((i-1) * (this.vDistance + this.height) + 20 + this.height);

                    // a vertical line to the center between the parents
                    lines = lines + ' v -' + this.height/2;

                }

                // set lines width and color
                this.canvas.path(lines).attr({"stroke-width": this.strokeWidth}).attr({"stroke": this.strokeColor});

            }
        }

        /* create a node of the tree

        x: left
        y: top
        width: width of the node
        height: height of the node
        person: a person to show information of
        image: an image to show in the centre; not implemented yet!
        */
        function addNode(x, y, width, height, person, image) {

            var color, borderColor;

            // create a node as a rectangle
            var node = this.canvas.rect(x, y, width, height, this.radius);

            // create a text inside the node
            var nodeText = this.canvas.text(x + width/2, y + height/2 - 10, this.getText(person));

            // set the font size of the text
            nodeText.attr("font-size", this.fontSize);

            // set the color attributes for the node
            switch (person.gender) {
            case 'male':
                color = this.maleFillColor;
                borderColor = this.maleBorderColor;
                break;
            case 'female':
                color = this.femaleFillColor;
                borderColor = this.femaleBorderColor;
                break;
            default:
                color = this.fillColor;
                borderColor = this.color;
            }

            node.attr({fill: color, stroke: borderColor, translation: "4,4", text: nodeText});

            if (this.blur) {
                node.blur(1);
            }

    //        if (image)
    //           var photo = canvas.image(image, x+40, y+20, 125, 100);

            // set onclick event handlers
            var click = this.onClick;

            node.text = nodeText;
            node.person = person;

            node.click(function() { click(person); });
            node.data = {'node': node, 'person': person};
            nodeText.click(function() { click(person); });
            nodeText.data = {'node': node, 'person': person};

            return {'node': node, 'text': nodeText};
        }

    };


    // private methods

    // return a one-dimensional array of all persons
    function unSort() {

        var persons = [];

        for (var i=0; i!=this.generations.length; i++) {
            for (var j=0; j!=this.generations[i].length; j++) {
                persons.push(this.generations[i][j]);
            }
        }

        return persons;
    }


    // sort persons into generations
    function sort(persons) {

        var generation = [],
            generations = [];

        if (!persons) {
            return false;
        }

        if (!persons.isArray) {
            persons = [persons];
        }

        if (persons.length === 0) {
            return [];
        }

        if (persons.length === 1) {
            return [persons];
        }

        // looking for a start person; the one with a father is a good candidate
        for (var i=0; i!=persons.length; i++) {
            if (persons[i].father) {
                break;
            }
        }

        // if there is no such a person, then the first one will be a start person
        if (i === persons.length) {
            var start_person = persons[0];
        } else {
            var start_person = persons[i];
        }

        var person = start_person;

        // get the oldest father
        while ((person.father) && (persons.indexOf(person.father) !== -1)) {
            person = person.father;
        }

        // append the father to the first generation
        generation.push(person);

        // append his/her partners, if they exist
        for (var i=0; i!=person.partners.length; i++) {

            partner = person.partners[i].person;

            if ((person.partners[i]) && (persons.indexOf(partner) !== -1))  {
                generation.push(partner);
            }
        }

        // append the couple as the first generation

        generations.push(generation);
        generation = [];

        // get their children
        children = getChildren(person, persons);

        var newChildren,
            children2 = [],
            child;


        // go back through all children
        while (children.length > 0) {

            newChildren = []
            // go through this generation's children
            for (var i=0; i!=children.length; i++) {

                // append a child to a new generation

                if (generation.indexOf(children[i]) === -1) {
                    generation.push(children[i]);
                }
                partners = children[i].partners;

                // append the child's partners to this generation
                for (var p=0; p!= partners.length; p++) {

                    partner = partners[p].person;

                    // if there is a partner, then they may have children
                    if ((partner) && (persons.indexOf(partner) !== -1)) {
                        // check if the partner is not a child of the same parent
                        // (otherwise (s)he's already in the generations)
                        if (children.indexOf(partner) === -1) {
                            // append the partner to the same generation
                            if (generation.indexOf(partner) === -1) {
                                generation.push(partner);
                            }

                            // get an array on their own children
                            children2 = getChildren(children[i], persons);

                            // compose an array of all the children's children
                            for (var k=0; k!=children2.length; k++) {
                                if (newChildren.indexOf(children2[k]) === -1) {
                                    //alert(children2[k].first_name);
                                    newChildren.push(children2[k]);
                                }
                            }
                        }
                    }
                }

            }

            // append a child and a partner as a new generation
            generations.push(generation);
            generation = []

            // children's list are now is the one of the next generation
            children = newChildren;
        }

        // deal with the others who are not in the generations yet
        var j = 0,
            found = 0,
            rounds = 0,
            found_this_round = false;

        // until all other persons are found
        while (found < persons.length) {

            found_this_time = false;
            person = persons[j];

            // if the person isn't in generations yet
            if (getPlace(person, generations) === -1) {

                // check the siblings
                siblings = getSiblings(person, persons);
                for (var i=0; i!=siblings.length; i++) {
                    sibling = siblings[i];

                    // if the sibling is in generations
                    if (getPlace(sibling, generations) !== -1) {
                        // append person to his/her generation
                        generation_index = getGeneration(sibling, generations);
                        if (generations[generation_index].indexOf(person) === -1) {
                            generations[generation_index].push(person);
                        }
                        found_this_time = true;
                        break;
                    }
                }

                // check the partners
                if (!found_this_time) {
                    for (var p=0; p<person.partners.length; p++) {

                        partner = person.partners[p].person;
                        if (partner) {
                            // if the partner is in generations
                            if (getPlace(partner, generations) !== -1) {
                                // append person to his/her generation
                                generation_index = getGeneration(partner, generations);
                                if (generations[generation_index].indexOf(person) === -1) {
                                    generations[generation_index].push(person);
                                }
                                found_this_time = true;
                            }
                        }
                    }
                }

                // check the father
                if (!found_this_time) {
                    father = person.father;
                    if (father) {
                        // if the father is in generations
                        if (getPlace(father, generations) !== -1) {
                            // append person to his/her generation, below the father's one
                            generation_index = getGeneration(father, generations);
                            // if father's generation is the last,
                            // create a new generation
                            if (generation_index === (generations.length-1)) {
                                generations.push([person]);
                            } else {
                                generations[generation_index+1].push(person);
                            }
                            found_this_time = true;
                        }
                    }
                }

                // check the children
                if (!found_this_time) {
                    children = getChildren(person, persons);
                    for (var i=0; i!=children.length; i++) {
                        child = children[i];
                        // if the child is in generations
                        if (getPlace(child, generations) !== -1) {
                            generation_index = getGeneration(child, generations);
                            if (generation_index > 0) {
                                generations[generation_index-1].push(person);
                            } else {
                                // if the child is in the last generation,
                                // create a new generation
                                generations.splice(0, 0, [person]);
                            }
                            found_this_time = true;
                            break;
                        }
                    }
                }

                if (found_this_time) {
                    found++;
                    found_this_round = true;
                }
            }

            // increase the cycle's counter
            j++;

            // if we have gone through all the list
            if (j > (persons.length-1)) {
                j = 0;
                rounds++;
                if (rounds > 1) {
                    // all not yet found persons are not connected to active_person
                    // we don't need them
                    if (!found_this_round) {
                        break;
                    }
                }
                found_this_round = false;
            }
        }

        return generations;

    }

    function buildTree(active_person, active_partner, persons)  {

        var root = null,
            partner = null,
            relatives = [],
            unprocessed = [],
            siblings = [];

        if (active_person) {

            root = active_person;
            // append active partner
            if (active_partner) {
                setActivePartner(root, active_partner);
                setActivePartner(active_partner, root);
                unprocessed.push(active_partner);
            } else {
                if (root.active_partner) {
                    setActivePartner(root.active_partner.person, root);
                    unprocessed.push(root.active_partner.person);
                }
            }
        } else {
            root = persons[0];

            // append active partner
            if (root.active_partner) {
                setActivePartner(root.active_partner.person, root);
                unprocessed.push(root.active_partner.person);
            }
        }

        unprocessed.push(root);

        // append siblings

        if (root.father && root.mother) {
            siblings = getActiveSiblings(root, persons);

            for (var i=0; i<siblings.length; i++) {
                if (unprocessed.indexOf(siblings[i]) === -1) {
                    unprocessed.push(siblings[i]);
                }
            }
        }

        while (unprocessed.length > 0) {

            p = unprocessed.pop();


            if (relatives.indexOf(p) === -1) {

                relatives.push(p);

                if (p.father) {
                    if (unprocessed.indexOf(p.father) === -1) {
                        unprocessed.push(p.father);
                    }
                }

                if (p.mother) {
                    if (unprocessed.indexOf(p.mother) === -1) {
                        unprocessed.push(p.mother);
                    }
                }

                if (p.father && p.mother) {

                    setActivePartner(p.father, p.mother);
                    setActivePartner(p.mother, p.father);
                }

                siblings = getActiveSiblings(p, persons);

                for (var i=0; i<siblings.length; i++) {
                    if (unprocessed.indexOf(siblings[i]) === -1) {
                        unprocessed.push(siblings[i]);
                    }
                }

                if ((p !== active_partner) && (p.active_partner)) {

                    if (unprocessed.indexOf(partner) === -1) {

                        partner = p.active_partner.person;
                        setActivePartner(partner, p);
                        unprocessed.push(partner);
                    }
                }
            }
        }


      // append children and their partners, and partners' parents

        var children = getActiveChildren(root, persons);

        for (var i=0; i<children.length; i++) {
            unprocessed.push(children[i]);
        }

        while (unprocessed.length > 0) {

            p = unprocessed.pop();

            if (relatives.indexOf(p) === -1) {
                relatives.push(p);

                if (p.active_partner) {

                    if (!p.partner_processed) {
                    // append partner
                        if (unprocessed.indexOf(p.active_partner.person) === -1) {
                            var pp = p.active_partner.person;
                            pp.partner_processed = true;
                            setActivePartner(pp, p);
                            unprocessed.push(pp);
                        }
                    }

                    // append active partner's parents

                    if (p.active_partner.person.father) {
                        if (unprocessed.indexOf(p.active_partner.person) === -1) {
                            unprocessed.push(p.active_partner.person.father);
                        }
                    }

                    if (p.active_partner.person.mother) {

                        if (unprocessed.indexOf(p.active_partner.person.mother) === -1) {
                            unprocessed.push(p.active_partner.person.mother);
                        }
                    }

                    // append active partner's siblings
                    siblings = getSiblings(p.active_partner.person, persons);

                    for (var i=0; i<siblings.length; i++) {
                        if  (unprocessed.indexOf(siblings[i]) === -1) {
                            unprocessed.push(siblings[i]);
                        }
                    }
                }

                // append children
                children2 = getActiveChildren(p, persons);

                for (var i=0; i<children2.length; i++) {
                    if (unprocessed.indexOf(children2[i]) === -1) {
                        unprocessed.push(children2[i]);
                    }

                }
            }

        }

        return relatives;

    }


    // get person's siblings from unsorted persons list
    function getSiblings(person, persons) {

        var siblings = [], areSiblings;

        if (person.father || person.mother) {

            for (var i=0; i!=persons.length; i++) {

                areSiblings = false;

                if (persons[i].father && person.father) {

                    if (persons[i].father === person.father) {
                        areSiblings = true;
                    }
                }

                if (persons[i].mother && person.mother) {

                    if (persons[i].mother === person.mother) {
                        areSiblings = true;
                    }
                }

                if ( (areSiblings) && (persons[i].id !== person.id) ) {
                    siblings.push(persons[i]);
                }
            }
        }

        return siblings;
    }


    // get person's siblings from same parent
    function getActiveSiblings(person, persons) {

        var siblings = [];

        if (person.father && person.mother) {

            for (var i=0; i!=persons.length; i++) {

                if (persons[i].father && persons[i].mother) {

                    if ((persons[i].father === person.father) && (persons[i].mother === person.mother))  {
                        if (persons[i].id !== person.id) {
                            siblings.push(persons[i]);
                        }
                    }
                }
            }
        }

        return siblings;
    }


    // get person's children with active partner from unsorted persons list
    function getActiveChildren(person, persons) {

        var children = [];

        if (person.active_partner) {

            for (var i=0; i!=persons.length; i++) {
                if (((persons[i].father === person) && (persons[i].mother === person.active_partner.person)) ||
                    ((persons[i].father === person.active_partner.person) && (persons[i].mother === person))) {
                    children.push(persons[i]);
                }
            }

        }

        return children;
    }


    // get person's children from unsorted persons list
    function getChildren(person, persons) {

        var children = [];

        for (var i=0; i!=persons.length; i++) {
            if ((persons[i].father === person) || (persons[i].mother === person)) {
                children.push(persons[i]);
            }
        }

        return children;
    }

    // return the person's place in the array
    function getPlace(person, persons) {
        var index;

        if (persons[0].isArray) {
            for (var i=0; i!=persons.length; i++) {
                index = persons[i].indexOf(person);
                if (index !== -1) {
                    return index;
                }
            }
        } else {
            index = persons.indexOf(person);
            if (index !== -1) {
                return index;
            }
        }

        return -1;
    }

    // return generation number
    function getGeneration(person, generations) {

        var generation;

        for (var i=0; i!=generations.length; i++) {

            generation = generations[i].indexOf(person);
            if (generation != -1) {
                return i;
            }

/*            for (var j=0; j!=generations[i].length; j++) {
                if (generations[i][j] === person) {
                    return i;
                }
            }
*/
        }
        return -1;
    }

    // check and correct partners' reciprocity
    function checkReciprocity() {
        
        var partner;
        
        for (var i=0; i<persons.length; i++) {
            
            for (var j=0; j<persons[i].partners.length; j++) {
                
                partner = persons[i].partners[j].person;
                
                if (partner) {
                    
                    var present = false;
                    
                    for (var k=0; k<partner.partners.length; k++) {
                        
                        if (partner.partners[k].person === persons[i]) {
                            present = true;
                            break;
                        }
                    }
                    
                    if (!present) {
                        partner.partners.push({person: persons[i]});
                    }
                }
                    
            }
        }
    }

    // convert person's parents and partners ids into person objects
    function checkRelations(person, persons) {

        // initialize others array with parents
        var others = [person.father, person.mother];

        // append partners' ids to others
        for (var i=0; i!=person.partners.length; i++) {
            others.push(person.partners[i].person);
        }
        
        // convert ids
        for (var i=0; i!=others.length; i++) {

            if (others[i]) {
                if (isInt(others[i])) {
                    for (var j=0; j!=persons.length; j++) {
                        if (persons[j].id === others[i]) {
                            switch (i) {
                            case 0:
                                person.father = persons[j];
                            break;
                            case 1:
                                person.mother = persons[j];
                            break;
                            default:
                                person.partners[i-2].person = persons[j];
                            break;
                            }
                            break;
                        }
                    }

                }
            }
        }
    }

    // convert active person and active partners ids to objects
    function checkActives(active_person, active_partner) {

        var active_person_object = null,
            active_partner_object = null;

        if (active_person) {
            if (isInt(active_person)) {
                for (var i=0; i!=persons.length; i++) {
                    if (persons[i].id === active_person) {
                        active_person_object = persons[i];
                        break;
                    }
                } 
            } else {
                active_person_object = active_person;
            }
        }

        if (active_partner) {
            if (isInt(active_partner)) {
                for (var i=0; i!=persons.length; i++) {
                    if (persons[i].id === active_partner) {
                        active_partner_object = persons[i];
                        break;
                    }
                }
            } else {
                active_partner_object = active_partner;
            }
        }
        
        return {'active_person': active_person_object, 'active_partner': active_partner_object};

    }


    // true if value is integer
    function isInt(value) {
      return !isNaN(value) &&
             parseInt(Number(value)) == value &&
             !isNaN(parseInt(value, 10));
    }


    // invert parents' places in the generation
    function invertParents(global_this) {

        var buff,
            person;

        for (var i=0; i<global_this.generations.length; i++) {

            for (var j=0; j<global_this.generations[i].length; j++) {

                person = global_this.generations[i][j];

                if (person.partners.length > 0) {

                    partner = person.active_partner.person;

                    if (person.father && person.mother && partner.father && partner.mother) {

                        place_person = getPlace(person, global_this.generations);
                        place_partner = getPlace(partner, global_this.generations);

                        place_father = getPlace(person.father, global_this.generations);
                        place_father_partner = getPlace(partner.father, global_this.generations);

                        if  ((place_father > place_person) && (place_father_partner < place_partner)) {

                            buff = global_this.generations[i-1][place_father];
                            global_this.generations[i-1][place_father] = global_this.generations[i-1][place_father_partner];
                            global_this.generations[i-1][place_father_partner] = buff;

                            buff = global_this.generations[i-1][place_father+1];
                            global_this.generations[i-1][place_father+1] = global_this.generations[i-1][place_father_partner+1];
                            global_this.generations[i-1][place_father_partner+1] = buff;

                        }
                    }
                }
            }
        }
    }

    // if male partner is right to female, change them
    function invertPartners(global_this) {

        var buff,
            person;

        for (var i=0; i<global_this.generations.length; i++) {

            for (var j=0; j<global_this.generations[i].length; j++) {

                person = global_this.generations[i][j];

                if (person.gender == 'male') {

                    if (person.partners.length > 0) {

                        if (person.active_partner) {
                            last_partner = person.active_partner.person;
                        } else {
                            last_partner = person.last_partner.person;
                        }

                        place_male = getPlace(person, global_this.generations);
                        place_female = getPlace(last_partner, global_this.generations);

                        if ((place_male > place_female) && (place_female !== -1) && (place_male !==-1)) {

                            if (place_male-place_female === 1) {
                                buff = global_this.generations[i][j];
                                global_this.generations[i][j] = global_this.generations[i][j-1];
                                global_this.generations[i][j-1] = buff;
                            } else {

                                buff = global_this.generations[i][place_female];
                                global_this.generations[i][place_female] = global_this.generations[i][place_male];

                                for (var k=0; k<place_male-place_female; k++) {
                                    global_this.generations[i][place_male-k] = global_this.generations[i][place_male-k-1];
                                }

                                global_this.generations[i][place_female+1] = buff;

                            }
                        }
                    }
                }
            }
        }
    }

    // get last pushed partner
    function getLastPartner(person) {

        partners = [];

        for (var i=0; i<person.partners.length; i++) {
            partners.push(person.partners[i]);
        }

       //sortByKey(partners, 'from');

        return partners[partners.length-1];
    }

    function sortByKey(array, key) {
        return array.sort(function(a, b) {
            var x = a[key]; var y = b[key];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    }

    // reinit all objects and redraw the tree
    function reDrawTree(active_person, active_partner, global_this) {

//        console.log('------------');

        initArrays(active_person, active_partner);

        var tree = buildTree(active_person, active_partner, persons);

        global_this.generations = sort(tree);

        invertPartners(global_this);
        invertParents(global_this);

        global_this.show();
    }

    // initialize all settings
    function initSettings(global_this) {

        // set up user or default settings
        global_this.color = settings.color || defaultColor;
        global_this.fillColor = settings.fillColor || defaultFillColor;
        global_this.maleFillColor = settings.maleFillColor || defaultMaleFillColor;
        global_this.femaleFillColor = settings.femaleFillColor || defaultFemaleFillColor;
        global_this.strokeColor = settings.strokeColor || defaultStrokeColor;
        global_this.maleBorderColor = settings.maleBorderColor || defaultMaleBorderColor;
        global_this.femaleBorderColor = settings.femaleBorderColor || defaultFemaleBorderColor;
        global_this.blur = settings.blur || defaultBlur;
        
        if (settings.radius === undefined) {
            global_this.radius = defaultRadius;
        } else {
            global_this.radius = settings.radius;
        }
        
        global_this.strokeWidth = settings.strokeWidth || defaultStrokeWidth;
        global_this.mouseoverColor = settings.mouseoverColor || defaultMouseoverColor;
        global_this.width = settings.width || defaultWidth;
        global_this.height = settings.height || defaultHeight;
        global_this.startX = settings.startX || defaultStartX;
        global_this.startY = settings.startY || defaultStartY;
        global_this.fontSize = settings.fontSize || defaultFontSize;
        global_this.vDistance = settings.vDistance || defaultVDistance;
        global_this.hDistance = settings.hDistance || defaultHDistance;
        global_this.onClick = settings.onClick || function(){};
        global_this.getText = settings.getText;
        global_this.mouseoverMaleBorderColor = settings.mouseoverMaleBorderColor || defaultMouseoverMaleBorderColor;
        global_this.mouseoverFemaleBorderColor = settings.mouseoverFemaleBorderColor || defaultMouseoverFemaleBorderColor;

        var actives = checkActives(settings.active_person, settings.active_partner);

        global_this.active_person = actives.active_person || defaultActivePerson;
        global_this.active_partner = actives.active_partner || defaultActivePartner;

    }

    // initialize onmouseover and onmouseout handlers
    function initHandlers(global_this) {

        // set the onmouseover and onmouseout event handlers
        var femaleColor = global_this.femaleFillColor;
        var maleColor = global_this.maleFillColor;
        var fillColor = global_this.fillColor;
        var maleBorderColor = global_this.maleBorderColor;
        var femaleBorderColor = global_this.femaleBorderColor;
        var mouseoverColor = global_this.mouseoverColor;
        var mouseoverMaleBorderColor = global_this.mouseoverMaleBorderColor;
        var mouseoverFemaleBorderColor = global_this.mouseoverFemaleBorderColor;

        global_this.onmouseover = function() {

            switch (this.data.person.gender) {
            case 'male':
                this.data.node.attr({fill: mouseoverColor,  stroke: mouseoverMaleBorderColor});
                break;
            case 'female':
                this.data.node.attr({fill: mouseoverColor, stroke: mouseoverFemaleBorderColor});
                break;
            default:
                this.data.node.attr({fill: mouseoverColor});

            }
        };

        global_this.onmouseout = function() {

            switch (this.data.person.gender) {
            case 'male':
                this.data.node.attr({fill: maleColor,  stroke: maleBorderColor});
                break;
            case 'female':
                this.data.node.attr({fill: femaleColor, stroke: femaleBorderColor});
                break;
            default:
                this.data.node.attr({fill: fillColor});
            }
        };
    }


    // 
    function initArrays(active_person, active_partner) {

        // set last partners, and actual partners as last
        for (var i=0; i<persons.length; i++) {
            if (persons[i].partners.length > 0) {
                persons[i].last_partner = getLastPartner(persons[i]);
                persons[i].active_partner = persons[i].last_partner;
            }
        }

        if ((active_person) && (active_partner)) {
            setActivePartner(active_person, active_partner);
            setActivePartner(active_partner, active_person);
        }

    }

    function getPartners(person) {

        if ((person) && (person.partners.length > 0) ) {

            var partners = [];

            for (var i=0; i<person.partners.length; i++) {
                partners.push(person.partners[i].person);
            }

            return partners;
        }
    }


    function setActivePartner(person, partner) {

        var found = false;

        if (person && partner) {

            if (person.partners.length >1) {

                for (var i=0; i<person.partners.length; i++) {
                    if (person.partners[i].person == partner) {
                        person.active_partner = person.partners[i];
                        found = true;
                        break;
                    }
                }

                if (found === false) {
                    console.log('Error in setting partners: partner not found: ' + person.active_partner.person.first_name);
                }
            }
        } else {

            if (person.partners.length !== 1) {
                console.log('Error in setting partners: something is missing');
                console.log(person.first_name);
                console.log(person.partners.length);
                console.log(partner.first_name);
            }
        }
    }
};
