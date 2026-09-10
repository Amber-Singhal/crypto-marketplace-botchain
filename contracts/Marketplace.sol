// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Marketplace {
    struct Listing {
        address seller;
        uint price;
        string title;
        string description;
        string image;
        bool sold;
        address buyer;
    }

    Listing[] public listings;

    function createListing(uint price, string calldata title, string calldata description, string calldata image) external {
        require(price > 0, "Price must be > 0");
        listings.push(Listing(msg.sender, price, title, description, image, false, address(0)));
    }

    function buyListing(uint id) external payable {
        require(id < listings.length, "Invalid listing");
        Listing storage listing = listings[id];
        require(!listing.sold, "Already sold");
        require(msg.sender != listing.seller, "Seller cannot buy");
        require(msg.value == listing.price, "Incorrect payment");

        listing.sold = true;
        listing.buyer = msg.sender;
        payable(listing.seller).transfer(msg.value);
    }

    function getAllListings() external view returns (Listing[] memory) {
        return listings;
    }
}
