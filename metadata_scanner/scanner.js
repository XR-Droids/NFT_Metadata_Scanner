/**
 * 🔎 NFT METADATA SCANNER v1.0
 * ℹ️ The NFT scanner reads the metadata JSON file, assigns to each items the  
 *	 	rarity score points based on attributes rarity, and produces the results in 
 *    a HTML list. 
 * 
 * ⚠ This tool will run only if your metadata has been 
 *		built in respect of the NFT metadata standards (example: 'trait_type':'...');
 * 
 * 
 * 🤖 XR-Droids 
 * 🌐 https://xrdroids.com
 *
 * Creator: Will
 *
 * Released on: May 06, 2023
 * Updated on: Jun 21, 2023
 */

const metadataFile 	= `../build/json/_metadata.json`; 
const nftPath		= `../build/images/`;

const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});

let keyOfValue = params.key;
let valueOfKey = params.attr;
let sortBy 		= params.sortBy;

let alertBot 		= document.querySelector("#alert-bot");
let attributesOutput	= document.querySelector("#attributes-output");
let dataOutput 		= document.querySelector("#data-output");

let sortOptionsBtn 	= document.querySelector("#sort-options");

function isMultiple(n, m)
{
	let r = n % m;
	return r;
}

let uniqueAttributes 		= [];
let uniqueAttributeCounts 	= [];
let uniqueAttributeRarity 	= [];

let itemList 	= [];
let rankedList  = [];

let attributesBtnList = [];

const scoreSorterAsc = (a, b) => {
   return b.score - a.score;
};
const sortByScoreAsc = arr => {
   arr.sort(scoreSorterAsc);
};

const scoreSorterDesc = (a, b) => {
   return a.score - b.score;
};
const sortByScoreDesc = arr => {
   arr.sort(scoreSorterDesc);
};

// FETCH UNIFIED METADATA FILE
fetch(metadataFile)
.then(function(response)
{
	return response.json();
})
.then(function(nfts)
{
	// FIND ALL ATTRIBUTES
   	for(let occurrence of nfts)
	{
	   for (i = 0; i < occurrence.attributes.length; i++) 
	   {
		let idx = uniqueAttributes.findIndex((object) => { 
			if (object.trait_type === occurrence.attributes[i].trait_type && object.value === occurrence.attributes[i].value) 
			{ return true; }});
	      	if (idx === -1) 
	      	{
	        	attributesBtnList.push({trait_type: occurrence.attributes[i].trait_type, value: occurrence.attributes[i].value});
	         	uniqueAttributes.push({trait_type: occurrence.attributes[i].trait_type, value: occurrence.attributes[i].value});
	      	}
	   }
   	}
	
	// GROUP ATTRIBUTES BY TRAITS FOR THE NAVIGATION MENU
	const traitsObj = {};
	for(const {trait_type, value} of attributesBtnList) 
	{
	   if(!traitsObj[trait_type]) traitsObj[trait_type] = [];
	   traitsObj[trait_type].push({ value });
	}

	// OUTPUT GROUPED TRAITS LIST AS NAV MENU
	let btnListAttrOutput = '';
	let sortedObject = [];
	for(trait of Object.entries(traitsObj))
	{  
		let traits = [];
		for(v of trait[1])
		{
			traits.push(v.value);
		}
		sortedObject.push({trait_type: trait[0], attributes: traits.sort()});
	}
	for(trait of sortedObject)
	{  
		btnListAttrOutput += `  <li class="nav-item dropdown">
						<a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            								${trait.trait_type} 
            					</a> 
            					<ul class="dropdown-menu">`;
      
		// IF KEYS SEPARATED BY SPACES AND 2+ WORDS ATTR -> ADD UNDERSCORE
      		let urlKey = '';
		let sKey = trait.trait_type.split(" ");
		if (sKey.length > 1) 
		{
			for (var j = 0; j < sKey.length; j++) 
			{
				if (j == sKey.length-1) 
				{
					urlKey += sKey[j];
				}
				else
				{
					urlKey += sKey[j]+'_';
				}
			}
		}
		else
		{
			urlKey = sKey[0];
		}

		for(v of trait.attributes)
		{
			// IF ATTRIBUTES SEPARATED BY SPACES AND 2+ WORDS ATTR -> ADD UNDERSCORE
			let urlAttr = '';
			let sAttribute = v.split(" ");
			if (sAttribute.length > 1) 
			{
				for (var j = 0; j < sAttribute.length; j++) 
				{
					if (j == sAttribute.length-1) 
					{
						urlAttr += sAttribute[j];
					}else{
						urlAttr += sAttribute[j]+'_';
					}
				}
			}
			else
			{
				urlAttr = sAttribute[0];
			}
			btnListAttrOutput += `		<li><a class="dropdown-item" href="./index.html?key=${urlKey}&attr=${urlAttr}">${v}</a></li>`;
		}
		btnListAttrOutput += `		</ul>
        				</li>`;
	}
	

	// COUNT OCCURRENCES FOR EACH UNIQUE ATTRIBUTE
	for (var i = 0; i < uniqueAttributes.length; i++) 
	{
		var count = 0;
	  	 for(let occurrence of nfts)
		{
	    		for (var j = 0; j < occurrence.attributes.length; j++) 
	    		{
	    			if (uniqueAttributes[i].value === occurrence.attributes[j].value && uniqueAttributes[i].trait_type === occurrence.attributes[j].trait_type) 
            			{
                			count++; 
           			 };
	    		}
		}
		uniqueAttributeCounts.push(count);
	}
	// CALCULATE % OF EACH UNIQUE ATTRIBUTES
	let percentageAttribute = 0;
	for (var i = 0; i < uniqueAttributeCounts.length; i++) 
	{
		percentageAttribute = (uniqueAttributeCounts[i]/nfts.length)*100;
		uniqueAttributeRarity.push(percentageAttribute);
	}

	// ADD RARITY SCORE TO EACH NFT ITEM
	for(let nft of nfts)
	{
		let nftAttributesRarity = [];
		let traits = [];

		// GET TRAITS AND RELATED VALUES and
		// GET ATTRIBUTES RARITY FOR EACH RELATED TRAIT VALUE
		for (var j = 0; j < nft.attributes.length; j++) 
	    	{
			for (var i = 0; i < uniqueAttributes.length; i++) 
			{
	    			if (uniqueAttributes[i].value === nft.attributes[j].value && uniqueAttributes[i].trait_type === nft.attributes[j].trait_type) 
            			{
            				nftAttributesRarity.push(uniqueAttributeRarity[i]);
		            		traits.push({trait_type: nft.attributes[j].trait_type, value: nft.attributes[j].value+" ("+uniqueAttributeRarity[i].toFixed(2)+"%)"});
		            	};
	    		}
		}

		// GET RARITY SCORE FROM ATTRIBUTES RARITY
		let attributeRarityScore = 0;
		let sumRarityScores = 0;
		for (var i = 0; i < nftAttributesRarity.length; i++) 
		{
			attributeRarityScore = 1/(nftAttributesRarity[i]/100); 
			sumRarityScores += attributeRarityScore;
		}
		// ADD NFT DATA WITH RARITY SCORE
		itemList.push({ name: nft.name, image: nft.image, score: Math.trunc(sumRarityScores*10000)/10000, attributes: traits });
	}

	// SORT THE WHOLE LIST BY SCORE AND ASSIGN RANKS
	sortByScoreAsc(itemList);
	let _rank = 0;
	for(let nft of itemList)
	{
		rankedList.push({ name: nft.name, image:nft.image, score: nft.score, rank: ++_rank, attributes: nft.attributes })
	}

	// SORTING OPTIONS | DEFAULT: SORT BY SCORE ASC
	// SORT A-Z
	if(sortBy === "az") 
	{
		rankedList.sort((a, b) => {
	    	let fa = a.name.substring(a.name.indexOf("#")+1), fb = b.name.substring(b.name.indexOf("#")+1);
	    	let faN = Number(fa);
	    	let fbN = Number(fb);

	    	if (faN < fbN) 
	    	{
	        	return -1;
	    	}
	    	if (faN > fbN) 
	    	{
	        	return 1;
	    	}
	    		return 0;
		});
	}
	// SORT Z-A
	if(sortBy === "za") 
	{
		rankedList.sort((a, b) => {
	    	let fa = a.name.substring(a.name.indexOf("#")+1), fb = b.name.substring(b.name.indexOf("#")+1);
	    	let faN = Number(fa);
	    	let fbN = Number(fb);

	    	if (faN > fbN) 
	    	{
	        	return -1;
	    	}
	    	if (faN < fbN) 
	    	{
	        	return 1;
	    	}
	    		return 0;
		});
	}
	// SORT BY SCORE DESC
	if(sortBy === "sd") 
	{
		sortByScoreDesc(rankedList);
	}

	let nftOutput = "";
	let indexArray = 0;

	// DISPLAY ALL ITEMS
	if (!valueOfKey && !keyOfValue) 
	{
		for(let nft of rankedList)
		{
			if (isMultiple(indexArray, 4) === 0 && indexArray !=0) 
			{
				nftOutput +=`</div><br><div class='row'>`;
			}
			if (indexArray === 0 ) 
			{
				nftOutput +=`<div class='row'>`;
			}
			// POINT TO THE FOLDER CONTAINING THE IMAGES
			var filename = nft.image.substring(nft.image.lastIndexOf('/')+1);
			let newNftPath = nftPath+''+filename;
			
			nftOutput +=`		<div class="col-lg-3 col-md-6 col-sm-12 col-sx-12">
										<div class="card h-100 bg-rgba-b">
									  		<img src='${newNftPath}' class="card-img-top" alt="NFT">
									  		<div class="card-body">
												   <h5 class="card-title"><b>${nft.name}</b></h5>
												   <p class="card-text"> <span class="rank">Rank</span> ${nft.rank} | <i class="rank">Score</i> ${nft.score}</p>
									    		<table class="card-attributes">`;
			for (var i = 0; i < nft.attributes.length; i++) 
			{
		        nftOutput += `				<tr>
		        										<td class="trait-txt">${nft.attributes[i].trait_type}:&nbsp;</td>
		        										<td class="trait-txt">${nft.attributes[i].value}</td>
		        									</tr>`;
			}
			nftOutput +=`					</table>
											</div>  
										</div>
									</div>`;
			if (indexArray === -1) 
			{
				nftOutput +=`</div>`;
			}
			++indexArray;
		}
	}
	else
	{
		for(let nft of rankedList)
		{
			let findAttr = 0;
			let findKey = 0;
			for (var i = 0; i < nft.attributes.length; i++) 
			{
				let urlKey = '';
				// IF TRAIT_TYPES SEPARATED BY SPACES AND 2+ WORDS ATTR -> ADD UNDERSCORE
				let sKey = nft.attributes[i].trait_type.split(" ");
				if (sKey.length > 1) 
				{
					for (var j = 0; j < sKey.length; j++) 
					{
						if (j == sKey.length-1) 
						{
							urlKey += sKey[j];
						}
						else
						{
							urlKey += sKey[j]+'_';
						}
					}
					if (urlKey == keyOfValue) 
					{
						
						let urlAttr = '';
						// IF ATTRIBUTES SEPARATED BY SPACES AND 2+ WORDS ATTR -> ADD UNDERSCORE
						let sAttribute = nft.attributes[i].value.split(" ");
						if (sAttribute.length > 2) 
						{
							for (var j = 0; j < sAttribute.length-1; j++) 
							{
								if (j == sAttribute.length-2) 
								{
									urlAttr += sAttribute[j];
								}
								else
								{
									urlAttr += sAttribute[j]+'_';
								}
							}

							if (urlAttr == valueOfKey) 
							{
								findAttr++;
							}
						}
						else
						{
							// IF ATTRIBUTES SEPARATED BY UNDERSCORES OR SINGLE WORD ATTR
							if (sAttribute[0] == valueOfKey) 
							{
								findAttr++;
							}
						}	
						findKey++;
					}
				}
				else
				{
					if (sKey[0] == keyOfValue) 
					{
						let urlAttr = '';
						// IF ATTRIBUTES SEPARATED BY SPACES AND 2+ WORDS ATTR -> ADD UNDERSCORE
						let sAttribute = nft.attributes[i].value.split(" ");
						if (sAttribute.length > 2) 
						{
							for (var j = 0; j < sAttribute.length-1; j++) 
							{
								if (j == sAttribute.length-2) 
								{
									urlAttr += sAttribute[j];
								}
								else
								{
									urlAttr += sAttribute[j]+'_';
								}
							}

							if (urlAttr == valueOfKey) 
							{
								findAttr++;
							}
						}
						else
						{
							// IF ATTRIBUTES SEPARATED BY UNDERSCORES OR SINGLE WORD ATTR
							if (sAttribute[0] == valueOfKey) 
							{
								findAttr++;
							}
						}	
						findKey++;
					}
				}	

			}

			if (findKey > 0 && findAttr > 0) 
			{
				if (isMultiple(indexArray, 4) === 0 && indexArray !=0) 
				{
					nftOutput +=`</div><br><div class='row'>`;
				}
				if (indexArray === 0 ) 
				{
					nftOutput +=`<div class='row'>`;
				}
				// POINT TO THE FOLDER CONTAINING THE IMAGES
				var filename = nft.image.substring(nft.image.lastIndexOf('/')+1);
				let newNftPath = nftPath+''+filename;
				
				nftOutput +=`		<div class="col-lg-3 col-md-6 col-sm-12 col-sx-12">
											<div class="card h-100 bg-rgba-b">
									  			<img src='${newNftPath}' class="card-img-top" alt="NFT">
									  			<div class="card-body">
												   <h5 class="card-title"><b>${nft.name}</b></h5>
												   <p class="card-text"> <span class="rank">Rank</span> ${nft.rank} | <i class="rank">Score</i> ${nft.score}</p>
												   <table class="card-attributes">`;
				for (var i = 0; i < nft.attributes.length; i++) 
				{

			        	nftOutput += `				<tr><td class="trait-txt">${nft.attributes[i].trait_type}:&nbsp;</td> 
			        									<td class="trait-txt">${nft.attributes[i].value}</td></tr>`;
				}
				nftOutput +=`					</table>
												</div>  
											</div>
										</div>`;

				if (indexArray === -1) 
				{
					nftOutput +=`</div>`;
				}

				++indexArray;
			}
		}
	}
	if (!valueOfKey && !keyOfValue) 
	{
		alertBot.innerHTML = `${indexArray} items have been found`;

		sortOptionsBtn.innerHTML = `<li><a class="dropdown-item" href="./index.html?sortBy=az">A-Z</a></li>
											 <li><a class="dropdown-item" href="./index.html?sortBy=za">Z-A</a></li>
											 <li><a class="dropdown-item" href="./index.html">Score Asc</a></li>
											 <li><a class="dropdown-item" href="./index.html?sortBy=sd">Score Desc</a></li>`;
	}
	else
	{
		alertBot.innerHTML = `Found <span class="toast-body-span">${indexArray}</span> 
		occurrences with property: <span class="toast-body-span">${keyOfValue}=${valueOfKey}</span>`;

		sortOptionsBtn.innerHTML = `<li><a class="dropdown-item" href="./index.html?key=${keyOfValue}&attr=${valueOfKey}&sortBy=az">A-Z</a></li>
											 <li><a class="dropdown-item" href="./index.html?key=${keyOfValue}&attr=${valueOfKey}&sortBy=za">Z-A</a></li>
											 <li><a class="dropdown-item" href="./index.html?key=${keyOfValue}&attr=${valueOfKey}">Score Asc</a></li>
											 <li><a class="dropdown-item" href="./index.html?key=${keyOfValue}&attr=${valueOfKey}&sortBy=sd">Score Desc</a></li>`;
	}

	attributesOutput.innerHTML += btnListAttrOutput;
	dataOutput.innerHTML = nftOutput;
});

$(document).ready(function() 
{
   let myAlert = document.querySelector('.toast');
   let bsAlert = new bootstrap.Toast(myAlert);
  
   setTimeout(function () 
   {
      bsAlert.show();
   }, 700);
});
