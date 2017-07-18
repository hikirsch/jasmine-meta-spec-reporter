jasmine-meta-spec-reporter
==========================

A reporter for Jasmine that allows you to save metadata and screenshots per spec.

# Usage

## Installation
Install `jasmine-meta-spec-reporter` via npm:

`npm install jasmine-meta-spec-reporter --save-dev`

## Configuration

Add the following to your `onPrepare` method in your config.
```javascript
jasmine.getEnv().addReporter( new MetaSpecReporter( {
  log: true,
  baseDirectory: 'test-results'
} ) );
```

## Usage

In your code, you can call the following methods

```javascript
MetaSpecReporter.queue( 'filename', /* base64 encoded data */ );
MetaSpecReporter.addMetadata( 'key', { ... } );
```

# TODO
 - more documentation with examples
 - tests

