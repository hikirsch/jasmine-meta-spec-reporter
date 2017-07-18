import { createWriteStream, mkdirsSync, writeJsonSync } from 'fs-extra';
import { resolve } from 'path';
import { IMetaSpecReporterOptions } from './interfaces/IMetaSpecReporterOptions';
import { ISpecScreenshot } from './interfaces/ISpecScreenshot';
import { pad } from './utils';

export class MetaSpecReporter implements jasmine.CustomReporter {
  private static log = false;

  private static _screenshots: ISpecScreenshot[] = [];
  private static _metadata: { [s: string]: any } = {};

  private screenshotCount: number = null;
  private screenshotMapCount: { [s: string]: number } = null;

  private currentSuite: string[] = [];
  private currentSpec: string = null;

  constructor( private options: IMetaSpecReporterOptions = null ) {
    if ( !this.options || !this.options.baseDirectory || this.options.baseDirectory.length === 0 ) {
      throw new Error( 'Please pass a valid base directory to store the screenshots into.' );
    }

    if ( this.options.log ) {
      MetaSpecReporter.log = this.options.log;
    }
  }

  public static queue( filename: string, data: string ) {
    MetaSpecReporter._screenshots.push( { filename, data } );

    if ( MetaSpecReporter.log ) {
      console.log( `${filename} Screenshot Queued` );
    }
  }

  public static addMetadata( key: string, data: any ) {
    MetaSpecReporter._metadata[ key ] = data;
  }

  specStarted( result: jasmine.CustomReporterResult ) {
    this.currentSpec = result.description;
    this.screenshotCount = 0;
    this.screenshotMapCount = {};
  }

  specDone( result: jasmine.CustomReporterResult ) {
    let destPath = resolve( this.options.baseDirectory, ...this.currentSuite, this.currentSpec );

    for ( let screenshot of MetaSpecReporter._screenshots ) {
      this.save( destPath, screenshot.filename, screenshot.data );
    }

    if ( Object.keys( MetaSpecReporter._metadata ).length > 0 ) {
      let jsonPath = resolve( destPath, 'metadata.json' );

      writeJsonSync( jsonPath, MetaSpecReporter._metadata, { spaces: 2 } );
    }

    MetaSpecReporter._screenshots = [];
    MetaSpecReporter._metadata = {};
  }

  suiteStarted( result: jasmine.CustomReporterResult ) {
    let friendlyPath = result.description.replace( /[^a-zA-Z0-9.-]/g, '_' );
    this.currentSuite.push( friendlyPath );
  }

  suiteDone( result: jasmine.CustomReporterResult ) {
    this.currentSuite.pop();
  }

  save( destPath: string, filename: string, data: string ) {
    mkdirsSync( destPath );

    if ( !this.screenshotMapCount[ filename ] ) {
      this.screenshotMapCount[ filename ] = 0;
    }

    const count = this.screenshotMapCount[ filename ];

    let screenshotFileName = count > 0
      ? `${filename}-${ count }`
      : filename;

    screenshotFileName = `${pad( this.screenshotCount, 3 )}-${screenshotFileName}`;

    this.screenshotCount += 1;

    let filePath = resolve( destPath, `${screenshotFileName}.png` );
    let stream = createWriteStream( filePath );

    stream.write( new Buffer( data, 'base64' ) );
    stream.end();

    this.screenshotMapCount[ filename ] += 1;

    if ( this.options.log ) {
      console.log( `Screenshot saved to ${filePath}` );
    }
  }
}
