const {GraphQLObjectType, GraphQLString, GraphQLList, GraphQLNonNull, GraphQLBoolean} = require('graphql');
const documentType = require('./document');
const keyValueType = require('./key_value');

const docSetType = new GraphQLObjectType({
    name: "DocSet",
    fields: {
        id: {type: GraphQLNonNull(GraphQLString)},
        selectors: {
            type: GraphQLNonNull(GraphQLList(GraphQLNonNull(keyValueType))),
            resolve: (root, args) => Object.entries(root.selectors)
        },
        selector: {
            type: GraphQLNonNull(GraphQLString),
            args: {
                id: {type: GraphQLNonNull(GraphQLString)}
            },
            resolve: (root, args) => root.selectors[args.id]
        },
        selectorString: {type: GraphQLNonNull(GraphQLString)},
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
        },
        documents: {
            type: GraphQLNonNull(GraphQLList(GraphQLNonNull(documentType))),
            resolve: (root, args, context, info) => {
                context.docSet = root;
                return root.documents();
            }
        },
        document: {
            type: documentType,
            args: {
                bookCode: {type: GraphQLNonNull(GraphQLString)}
            },
            resolve: (root, args) => root.documentWithBook(args.bookCode)
        }
    },
})

module.exports = docSetType;

