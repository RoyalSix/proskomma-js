const {GraphQLObjectType, GraphQLString, GraphQLList, GraphQLNonNull, GraphQLBoolean} = require('graphql');

const sequenceType = require('./sequence');
const keyValueType = require('./key_value');

const headerById = (root, id) =>
    (id in root.headers) ? root.headers[id] : null;

const documentType = new GraphQLObjectType({
    name: "Document",
    fields: () => ({
        id: {type: GraphQLNonNull(GraphQLString)},
        docSetId: {type: GraphQLNonNull(GraphQLString)},
        headers: {
            type: GraphQLNonNull(GraphQLList(GraphQLNonNull(keyValueType))),
            resolve: root => Object.entries(root.headers)
        },
        header: {
            type: GraphQLString,
            args: {
                id: {
                    type: GraphQLNonNull(GraphQLString)
                }
            },
            resolve: (root, args) => headerById(root, args.id)
        },
        mainSequence: {
            type: GraphQLNonNull(sequenceType),
            resolve: (root, args, context, info) => {
                context.docSet = root.processor.docSets[root.docSetId];
                return root.sequences[root.mainId];
            }

        },
        sequences: {
            type: GraphQLNonNull(GraphQLList(GraphQLNonNull(sequenceType))),
            resolve: (root, args, context, info) => {
                context.docSet = root.processor.docSets[root.docSetId];
                return Object.values(root.sequences);
            }
        },
        tags: {
            type: GraphQLNonNull(GraphQLList(GraphQLNonNull(GraphQLString))),
            resolve: root => Array.from(root.tags)
        },
        hasTag: {
            type: GraphQLNonNull(GraphQLBoolean),
            args: {
                tagName: {
                    type: GraphQLNonNull(GraphQLString)
                }
            },
            resolve: (root, args) => root.tags.has(args.tagName)
        }
    })
})

module.exports = documentType;
