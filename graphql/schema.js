const { gql } = require('apollo-server');
const mongoose = require('mongoose');

require('dotenv').config();

const uri = process.env.MONGODB_URI;

mongoose.connect(uri).then(() => {
    console.log('MongoDB connected successfully');
}).catch(error => {
    console.error('Connection error', error.message);
});

const HouseSchema = new mongoose.Schema({
    name: String,
    members: [String],
    sigil : String,
});

const House = mongoose.model('House', HouseSchema);

const typeDefs = gql`
    type Query {
        rytsas: String
        houses: [House]
}

    type Mutation {
        addHouse(name: String!, members: [String]!, sigil: String!): House
        deleteHouse(id: ID!): House
        addMemberToHouse(id: ID!, member: String!): House
        deleteMemberFromHouse(id: ID!, member: String!): House 
}

    type House {
        id: ID
        name: String
        members: [String]
        sigil: String
}
`;

const resolvers = {
    Query: {
        rytsas: () => 'Sōnar mastan!',
        houses: async () => {
            try {
                const houses = await House.find();
                return houses;
        }   catch (error) {
                console.error('Error fetching houses:', error.message);
                return [];
        }
    },
    },
    Mutation: {
        addHouse: async (_, { name, members, sigil }) => {
            const newHouse = new House({ name, members, sigil });
            await newHouse.save();
            return newHouse;
    },
        deleteHouse: async (_, { id }) => {
            const deletedHouse = await House.findByIdAndDelete(id);
            return deletedHouse;
    },
        addMemberToHouse: async (_, { id, member }) => {
            const house = await House.findById(id);
            if (!house) {
            throw new Error('House not found');
        }
            house.members.push(member);
            await house.save();
            return house;
    },
        deleteMemberFromHouse: async (_, { id, member }) => {
            const house = await House.findById(id);
            if (!house) {
            throw new Error('House not found');
        }
            house.members = house.members.filter(m => m !== member);
            await house.save();
            return house;
    },
    },
};

module.exports = { typeDefs, resolvers };
