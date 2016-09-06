// Nimble, streamable HTTP client for Node.js. 
var needle = require("needle");

// Load FileSystem for Node.js API
var fs = require('fs');

// Usage: Waiting for the initialization of droplet
var sleep = require('sleep');

var config = {};
config.token = process.env.TOKEN; // Personal access tokens

var headers =
{
	'Content-Type':'application/json',
	Authorization: 'Bearer ' + config.token
};

var client =
{
	createDroplet: function ( dropletName, region, imageName, onResponse )
	{
		var data = 
		{
			"name": dropletName,
			"region":region,
			"size":"512mb",
			"image":imageName,
			// Obtain by `list_ssh_keys.rb`.
			"ssh_keys":[3277379],
			//"ssh_keys":null,
			"backups":false,
			"ipv6":false,
			"user_data":null,
			"private_networking":null
		};

		console.log("Attempting to create: "+ JSON.stringify(data) );
		needle.post("https://api.digitalocean.com/v2/droplets", data, {headers:headers,json:true}, onResponse );
	},
	retrieveDropletIp: function ( dropletId, onResponse ){
		needle.get("https://api.digitalocean.com/v2/droplets/" + dropletId, {headers:headers,json:true}, onResponse);
	}
};

// Create an droplet with the specified name, region, and image
var name = "DevOps-HW1";
var region = "nyc1";
var image = "ubuntu-14-04-x64";
var dropletId = 0;
client.createDroplet(name, region, image, function(err, resp, body)
{
	// StatusCode 202 - Means server accepted request.
	if(!err && resp.statusCode == 202)
	{
		dropletId = body.droplet.id;
		console.log("\ndropletId: ", dropletId);
		console.log("\nSleep 40 seconds before retrieving IP address...");
		sleep.sleep(40);

		// Retrieve droplet IP and append a new record to Iventory file.
		client.retrieveDropletIp(dropletId, function(err, resp, body)
		{
			if(!err && resp.statusCode == 200)
			{
				// Fetch public ip address
				var ipAddress = body.droplet.networks.v4[0].ip_address
				console.log("\nDroplet IP address: ", ipAddress);
				// Concatenate Inventory record
		        // eg. node0 ansible_host=192.168.1.103 ansible_user=vagrant ansible_ssh_private_key_file=./keys/node0.key
		        var str1 = "\nnode1 ansible_host=";
		        var str2 = " ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/DevOps_DigitalOcean_rsa";
		        var record = str1.concat(ipAddress, str2);

		        // Update Inventory file
		        fs.appendFile("Inventory", record, function(err) {
		            if(err) {
		                return console.log(err);
		            }
		            console.log("Inventory is updated successfully!");
		        });
			}
		});
	}
});

